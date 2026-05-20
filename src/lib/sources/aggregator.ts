import Parser from 'rss-parser'
import { detectarProvincias, getProvinciaNombre } from './provincial'
import type { NoticiaItem } from '@/types/noticias'

const FEEDS_NACIONALES = [
  { nombre: 'Infobae', url: 'https://www.infobae.com/feeds/rss/', provincia: 'nacional' },
  { nombre: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', provincia: 'nacional' },
  { nombre: 'Clarín', url: 'https://www.clarin.com/rss/politica/', provincia: 'nacional' },
  { nombre: 'Télam', url: 'https://www.telam.com.ar/rss/politica.xml', provincia: 'nacional' },
  { nombre: 'Página 12', url: 'https://www.pagina12.com.ar/rss/secciones/el-pais/notas', provincia: 'nacional' },
]

export function buildNoticiaId(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

export function sortByDate(items: NoticiaItem[]): NoticiaItem[] {
  return [...items].sort(
    (a, b) => new Date(b.publicadoAt).getTime() - new Date(a.publicadoAt).getTime()
  )
}

export function limitNoticias(items: NoticiaItem[], n: number): NoticiaItem[] {
  return items.slice(0, n)
}

interface FeedSource {
  nombre: string
  url: string
  provincia: string
}

async function fetchFeed(source: FeedSource): Promise<NoticiaItem[]> {
  const parser = new Parser({ timeout: 8000 })
  try {
    const parsed = await parser.parseURL(source.url)
    const items: NoticiaItem[] = []

    for (const item of parsed.items ?? []) {
      const titulo = item.title ?? ''
      if (!titulo || !item.link) continue

      const provinciasDetectadas = detectarProvincias(titulo, source.provincia)
      for (const provinciaSlug of provinciasDetectadas) {
        items.push({
          id: buildNoticiaId(`${item.link}-${provinciaSlug}`),
          titulo,
          url: item.link,
          fuente: source.nombre,
          provinciaSlug,
          provinciaNombre: getProvinciaNombre(provinciaSlug),
          publicadoAt: item.pubDate ?? new Date().toISOString(),
        })
      }
    }
    return items
  } catch {
    return []
  }
}

export interface MedioInput {
  nombre: string
  urlRss: string | null
  dominio?: string | null
  provinciaSlug: string
}

async function fetchSiteViaGoogleNews(medio: MedioInput): Promise<NoticiaItem[]> {
  if (!medio.dominio) return []
  const { fetchGoogleNewsForSite } = await import('./googleNews')
  const items = await fetchGoogleNewsForSite(medio.dominio, medio.nombre)
  return items
    .filter(it => it.url)
    .map(it => ({
      id: buildNoticiaId(`${it.url}-${medio.provinciaSlug}`),
      titulo: it.titulo,
      url: it.url as string,
      fuente: medio.nombre,
      provinciaSlug: medio.provinciaSlug,
      provinciaNombre: getProvinciaNombre(medio.provinciaSlug),
      publicadoAt: it.publicadoAt,
    }))
}

export async function fetchTodasLasNoticias(
  mediosLocales: MedioInput[] = []
): Promise<NoticiaItem[]> {
  // Medios con RSS → feed normal
  const fuentesRSS: FeedSource[] = mediosLocales
    .filter(m => m.urlRss)
    .map(m => ({
      nombre: m.nombre,
      url: m.urlRss as string,
      provincia: m.provinciaSlug,
    }))

  // Medios sin RSS pero con dominio → Google News site:
  const mediosPorDominio = mediosLocales.filter(m => !m.urlRss && m.dominio)

  const todasFuentes = [...FEEDS_NACIONALES, ...fuentesRSS]
  const [rssResults, ...porDominio] = await Promise.all([
    Promise.allSettled(todasFuentes.map(fetchFeed)),
    ...mediosPorDominio.map(m =>
      fetchSiteViaGoogleNews(m).catch(() => [] as NoticiaItem[])
    ),
  ])

  const todas = [
    ...rssResults.flatMap(r => r.status === 'fulfilled' ? r.value : []),
    ...porDominio.flat(),
  ]

  const seen = new Set<string>()
  const deduplicadas = todas.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  return sortByDate(deduplicadas)
}
