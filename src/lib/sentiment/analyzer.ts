import { fetchAllRSSFeeds, medioToFeed } from '@/lib/sources/rss'
import { fetchNewsForKeywords } from '@/lib/sources/googleNews'
import { getMediosLocales } from '@/lib/supabase/medios-queries'
import { fetchFacebookPosts } from '@/lib/sources/facebook'
import { fetchAvisosPoliticos } from '@/lib/sources/adlibrary'
import { fetchInstagramPosts } from '@/lib/sources/apify'
import { fetchGoogleTrends } from '@/lib/sources/trends'
import { fetchYouTubeData } from '@/lib/sources/youtube'
import { guardarTendencia } from '@/lib/supabase/tendencias-queries'
import { analizarPorKeywords } from './huggingface'
import {
  getPoliticos,
  guardarMenciones,
  guardarImagenHistorico,
  calcularImagenActual,
} from '@/lib/supabase/politicos-queries'
import { guardarAvisos } from '@/lib/supabase/avisos-queries'
import type { Mencion } from '@/types/imagen'

interface NewsItem {
  titulo: string
  url: string | null
  publicadoAt: string
  fuente: string
}

export function filtrarPorKeywords(
  items: { titulo: string }[],
  keywords: string[]
): { titulo: string }[] {
  return items.filter((item) =>
    keywords.some((kw) => item.titulo.toLowerCase().includes(kw.toLowerCase()))
  )
}

export function deduplicate<T extends { titulo: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.titulo.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Palabras de cargo que NO son nombres de lugar
const PALABRAS_CARGO = [
  'intendente', 'gobernador', 'municipio', 'alcalde', 'senador', 'diputado',
  'candidato', 'comisionada', 'comisionado', 'presidente', 'ministro', 'secretario',
]

/**
 * Extrae keywords de lugar desde las palabras clave de un político.
 * Ej: "Caleta Olivia intendente" → "Caleta Olivia"
 *     "Pablo Carrizo" → se omite (nombre de persona)
 */
function extraerKeywordsCiudad(palabrasClave: string[]): string[] {
  const resultados = new Set<string>()
  for (const kw of palabrasClave) {
    const sinCargo = kw
      .split(' ')
      .filter(w => !PALABRAS_CARGO.includes(w.toLowerCase()))
      .join(' ')
      .trim()
    // Solo agregar si parece un lugar (tiene mayúsculas, >4 chars, no es solo apellido)
    if (sinCargo.length > 4 && /\s/.test(sinCargo)) {
      resultados.add(sinCargo)
    }
  }
  return [...resultados]
}

/**
 * Analiza un político en 2 etapas:
 * 1. Busca por su nombre (directo)
 * 2. Si hay pocas menciones, amplía con el nombre de su ciudad
 * Esto garantiza que intendentes locales obtengan datos aunque no salgan en medios nacionales.
 */
async function analizarPolitico(
  politicoId: number,
  palabrasClave: string[],
  cargo: string,
  noticias: NewsItem[]
): Promise<number> {
  // Etapa 1: menciones DIRECTAS por nombre del político
  const directas = deduplicate(filtrarPorKeywords(noticias, palabrasClave) as NewsItem[])

  // Etapa 2: fallback por ciudad para CONTAR noticias locales
  // (NO se usa para calcular imagen — evita que "obras en Caleta Olivia" dé 100% positivo)
  const esLocal = ['intendente', 'gobernador', 'concejal', 'otro'].includes(cargo)
  let adicionales: NewsItem[] = []
  if (directas.length < 6 && esLocal) {
    const keywordsCiudad = extraerKeywordsCiudad(palabrasClave)
    if (keywordsCiudad.length > 0) {
      adicionales = deduplicate(
        filtrarPorKeywords(noticias, keywordsCiudad) as NewsItem[]
      ).filter(c => !directas.some(r => r.titulo === c.titulo)).slice(0, 20)
    }
  }

  const todasRelevantes = [...directas, ...adicionales]
  if (todasRelevantes.length === 0) return 0

  const menciones: Omit<Mencion, 'id'>[] = []
  for (const noticia of todasRelevantes.slice(0, 30)) {
    const { sentimiento, score } = analizarPorKeywords(noticia.titulo)
    menciones.push({
      politicoId,
      fuente: noticia.fuente,
      titulo: noticia.titulo,
      url: noticia.url,
      sentimiento,
      score,
      publicadoAt: noticia.publicadoAt,
    })
  }

  await guardarMenciones(menciones)

  // Imagen solo se calcula con menciones DIRECTAS (Etapa 1), nunca con el fallback de ciudad
  // Esto evita que "Puerto Deseado tiene obras" genere 100% positivo para el intendente
  if (directas.length > 0) {
    const mencionesDirectas = menciones.filter(m =>
      directas.some(d => d.titulo === m.titulo)
    )
    const imagen = calcularImagenActual(politicoId, mencionesDirectas)
    if (imagen) await guardarImagenHistorico(imagen)
  }

  return menciones.length
}

export async function ejecutarAnalisisCompleto(): Promise<{
  procesados: number
  fuentes: Record<string, number>
  detalle: { nombre: string; menciones: number }[]
  error?: string
}> {
  const fuentes: Record<string, number> = { rss: 0, google_news: 0, facebook: 0, youtube: 0, trends: 0 }
  const detalle: { nombre: string; menciones: number }[] = []

  try {
    const politicos = await getPoliticos(true)
    if (politicos.length === 0) {
      return {
        procesados: 0, fuentes, detalle,
        error: 'No hay políticos cargados. Ejecutá la migración 012_fix_columnas_y_seed.sql en Supabase.',
      }
    }

    // Google News: queries amplias que cubren TODOS los actores de Santa Cruz
    const googleQueries = [
      'Santa Cruz Argentina política noticias hoy',      // cobertura SC general
      'Javier Milei Argentina presidente gobierno',       // presidente
      'Claudio Vidal gobernador Santa Cruz patagonia',    // gobernador
      'Pablo Grasso intendente Río Gallegos municipio',   // intendente capital
      'Caleta Olivia municipio noticias actualidad',      // norte SC
      'El Calafate municipio noticias turismo patagonia', // oeste SC
      'Las Heras Pico Truncado Puerto Deseado Santa Cruz',// deseado
      'San Julián Gregores Perito Moreno Los Antiguos',   // centro SC
      'El Chaltén Río Turbio Piedra Buena 28 noviembre',  // sur SC
    ]

    // Medios que el admin agregó en /admin/medios — siempre incluidos
    const mediosLocales = await getMediosLocales().catch(() => [])
    const extraFeeds = mediosLocales
      .filter(m => m.urlRss)
      .map(m => medioToFeed({ nombre: m.nombre, urlRss: m.urlRss, provinciaSlug: m.provinciaSlug }))

    const [rssItems, googleResults] = await Promise.all([
      fetchAllRSSFeeds(extraFeeds).catch((e) => { console.error('[RSS]', e.message); return [] }),
      Promise.all(
        googleQueries.map(q =>
          fetchNewsForKeywords([q]).catch((e) => { console.error('[GNews]', q, e.message); return [] })
        )
      ),
    ])

    const googleItems = googleResults.flat()
    fuentes.rss = rssItems.length
    fuentes.google_news = googleItems.length
    const todasNoticias = [...rssItems, ...googleItems]

    for (const politico of politicos) {
      // Análisis principal (2 etapas: nombre + ciudad fallback)
      const menciones = await analizarPolitico(
        politico.id,
        politico.palabrasClave,
        politico.cargo,
        todasNoticias
      )
      detalle.push({ nombre: politico.nombre, menciones })

      // Facebook (solo si hay credenciales)
      if (politico.facebookPageId) {
        const fbPosts = await fetchFacebookPosts(politico.facebookPageId).catch(() => [])
        if (fbPosts.length > 0) {
          fuentes.facebook += fbPosts.length
          await guardarMenciones(fbPosts.map(post => ({
            politicoId: politico.id,
            fuente: 'facebook',
            titulo: post.titulo,
            url: post.url,
            sentimiento: post.sentimientoFinal.sentimiento,
            score: post.sentimientoFinal.score,
            publicadoAt: post.publicadoAt,
          })))
        }
      }

      // Ad Library Facebook (solo con token)
      const avisos = await fetchAvisosPoliticos(politico.nombre).catch(() => [])
      if (avisos.length > 0) {
        await guardarAvisos(politico.id, avisos)
        await guardarMenciones(avisos.map(a => ({
          politicoId: politico.id,
          fuente: 'facebook_ad',
          titulo: a.texto,
          url: a.urlPreview,
          sentimiento: analizarPorKeywords(a.texto).sentimiento,
          score: analizarPorKeywords(a.texto).score,
          publicadoAt: a.fechaInicio ?? new Date().toISOString(),
        })))
      }

      // Instagram via Apify (solo con token)
      if (politico.instagramUsername) {
        const igPosts = await fetchInstagramPosts(politico.instagramUsername).catch(() => [])
        if (igPosts.length > 0) {
          await guardarMenciones(igPosts.map(p => ({
            politicoId: politico.id,
            fuente: 'instagram',
            titulo: p.titulo,
            url: p.url,
            sentimiento: p.sentimiento.sentimiento,
            score: p.sentimiento.score,
            publicadoAt: p.publicadoAt,
          })))
        }
      }

      // Google Trends (sin API key)
      const trends = await fetchGoogleTrends(politico.nombre, politico.palabrasClave).catch(() => null)
      if (trends) {
        fuentes.trends++
        await guardarTendencia(politico.id, 'google_trends', trends.interesActual, trends.porProvincia.length)
      }

      // YouTube (solo con YOUTUBE_API_KEY)
      const ytData = await fetchYouTubeData(politico.nombre, politico.palabrasClave).catch(() => null)
      if (ytData && ytData.comentarios.length > 0) {
        fuentes.youtube += ytData.comentarios.length
        await guardarMenciones(ytData.comentarios.map(c => ({
          politicoId: politico.id,
          fuente: 'youtube',
          titulo: c.texto,
          url: null,
          sentimiento: c.sentimiento.sentimiento,
          score: c.sentimiento.score,
          publicadoAt: c.publicadoAt,
        })))
        await guardarTendencia(politico.id, 'youtube', Math.round(ytData.scorePromedio * 100), ytData.totalVideos)
      }

      await new Promise(r => setTimeout(r, 200))
    }

    return { procesados: politicos.length, fuentes, detalle }
  } catch (e) {
    return { procesados: 0, fuentes, detalle, error: String(e) }
  }
}
