// Scanner genérico de problemáticas por provincia.
// Funciona para CUALQUIER provincia: usa los municipios cargados en la BD
// como localidades a detectar, y los medios locales configurados en
// /admin/medios para esa provincia.
//
// La detección de categoría/severidad reutiliza las constantes de problematicas-sc.

import { fetchAllRSSFeeds, medioToFeed } from './rss'
import { fetchGoogleNewsForSite } from './googleNews'
import { fetchSiteViaScraping } from './htmlScraper'
import { detectarCategoria } from './problematicas-sc'
import { getMediosLocales } from '@/lib/supabase/medios-queries'
import { getMunicipiosByProvincia, getProvincias } from '@/lib/supabase/queries'

export interface ProblemaProvincial {
  provinciaSlug: string
  localidadSlug: string
  localidadNombre: string
  categoria: string
  titulo: string
  fuenteNombre: string
  url: string | null
  severidad: 1 | 2 | 3
  publicadoAt: string
}

interface LocalidadDetector {
  slug: string
  nombre: string
  keywords: string[]
}

// Normalizar para matching (lower + sin acentos)
function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Construir keywords para detectar la localidad en titulares
function buildKeywords(nombreMunicipio: string): string[] {
  const base = nombreMunicipio.trim()
  const lower = base.toLowerCase()
  const sinAcentos = norm(base)
  const keywords = new Set<string>([lower, sinAcentos])

  // Si tiene varias palabras, también la última palabra (caso "Río Cuarto" → "cuarto" no funciona — pero "rio cuarto" sí)
  // Solo agregamos variantes seguras
  if (lower.startsWith('puerto ')) keywords.add(lower.replace(/^puerto\s/, ''))
  if (lower.startsWith('san ') || lower.startsWith('santa ')) {
    // mantenemos como está
  }

  return Array.from(keywords).filter(k => k.length >= 4)
}

function detectarLocalidad(titulo: string, lista: LocalidadDetector[]): { slug: string; nombre: string } | null {
  const t = norm(titulo)
  for (const loc of lista) {
    if (loc.keywords.some(k => t.includes(k))) {
      return { slug: loc.slug, nombre: loc.nombre }
    }
  }
  return null
}

export async function escanearProvincia(provinciaSlug: string): Promise<ProblemaProvincial[]> {
  const [provincias, municipios, todosMedios] = await Promise.all([
    getProvincias().catch(() => []),
    getMunicipiosByProvincia(provinciaSlug).catch(() => []),
    getMediosLocales().catch(() => []),
  ])

  const provincia = provincias.find(p => p.slug === provinciaSlug)
  if (!provincia) return []

  const mediosProv = todosMedios.filter(m => m.provinciaSlug === provinciaSlug)
  // Sin medios → no podemos detectar nada. Devolvemos vacío.
  if (mediosProv.length === 0) return []

  // Build localidades a detectar desde los municipios cargados.
  // Si la provincia no tiene municipios cargados, igual permitimos que noticias
  // de medios locales caigan en una "localidad" genérica con el slug de la provincia.
  const localidades: LocalidadDetector[] = municipios
    .filter(m => m.nombre.length >= 4)
    .map(m => ({
      slug: m.slug,
      nombre: m.nombre,
      keywords: buildKeywords(m.nombre),
    }))

  // Set de nombres de medios locales — los items de estos medios se incluyen
  // aunque no detectemos localidad específica (caen en "(general)" con slug de provincia)
  const fuentesLocales = new Set(mediosProv.map(m => m.nombre))

  // Build feeds
  const feedsRSS = mediosProv
    .filter(m => m.urlRss)
    .map(m =>
      medioToFeed({
        nombre: m.nombre,
        urlRss: m.urlRss as string,
        provinciaSlug: m.provinciaSlug,
      })
    )
  const mediosPorDominio = mediosProv.filter(m => !m.urlRss && m.dominio)
  const mediosPorScraping = mediosProv.filter(m => !m.urlRss && !m.dominio && m.urlScraping)

  const [rssItems, ...itemsExtras] = await Promise.all([
    fetchAllRSSFeeds(feedsRSS).catch(() => []),
    ...mediosPorDominio.map(m =>
      fetchGoogleNewsForSite(m.dominio as string, m.nombre).catch(() => [])
    ),
    ...mediosPorScraping.map(m =>
      fetchSiteViaScraping(m.urlScraping as string, m.nombre).catch(() => [])
    ),
  ])

  const todasNoticias = [...rssItems, ...itemsExtras.flat()]
  const problemas: ProblemaProvincial[] = []
  const urlsVistas = new Set<string>()

  for (const noticia of todasNoticias) {
    if (!noticia.titulo || noticia.titulo.length < 10) continue
    if (noticia.url && urlsVistas.has(noticia.url)) continue
    if (noticia.url) urlsVistas.add(noticia.url)

    let localidad = detectarLocalidad(noticia.titulo, localidades)

    // Si es fuente local pero no matchea localidad → cae en "(general)" con slug de provincia
    if (!localidad && fuentesLocales.has(noticia.fuente)) {
      localidad = {
        slug: provinciaSlug,
        nombre: `${provincia.nombre} (general)`,
      }
    }

    if (!localidad) continue

    const { categoria, severidad } = detectarCategoria(noticia.titulo)

    problemas.push({
      provinciaSlug,
      localidadSlug: localidad.slug,
      localidadNombre: localidad.nombre,
      categoria,
      severidad,
      titulo: noticia.titulo,
      fuenteNombre: noticia.fuente,
      url: noticia.url,
      publicadoAt: noticia.publicadoAt,
    })
  }

  // Ordenar: severidad desc → fecha desc
  return problemas.sort((a, b) => {
    if (b.severidad !== a.severidad) return b.severidad - a.severidad
    return new Date(b.publicadoAt).getTime() - new Date(a.publicadoAt).getTime()
  })
}
