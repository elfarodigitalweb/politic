import { fetchAllRSSFeeds } from '@/lib/sources/rss'
import { fetchNewsForKeywords } from '@/lib/sources/googleNews'
import { fetchFacebookPosts } from '@/lib/sources/facebook'
import { fetchAvisosPoliticos } from '@/lib/sources/adlibrary'
import { fetchInstagramPosts } from '@/lib/sources/apify'
import { fetchGoogleTrends } from '@/lib/sources/trends'
import { fetchYouTubeData } from '@/lib/sources/youtube'
import { guardarTendencia } from '@/lib/supabase/tendencias-queries'
import { analyzeSentiment, analizarPorKeywords } from './huggingface'
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
  return items.filter(item =>
    keywords.some(kw =>
      item.titulo.toLowerCase().includes(kw.toLowerCase())
    )
  )
}

export function deduplicate<T extends { titulo: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.titulo.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function analizarPolitico(
  politicoId: number,
  palabrasClave: string[],
  noticias: NewsItem[]
): Promise<void> {
  const relevantes = deduplicate(
    filtrarPorKeywords(noticias, palabrasClave) as NewsItem[]
  )
  if (relevantes.length === 0) return

  const menciones: Omit<Mencion, 'id'>[] = []
  for (const noticia of relevantes.slice(0, 20)) {
    const { sentimiento, score } = await analyzeSentiment(noticia.titulo)
    menciones.push({
      politicoId,
      fuente: noticia.fuente,
      titulo: noticia.titulo,
      url: noticia.url,
      sentimiento,
      score,
      publicadoAt: noticia.publicadoAt,
    })
    await new Promise(r => setTimeout(r, 150))
  }

  await guardarMenciones(menciones)

  const imagen = calcularImagenActual(politicoId, menciones)
  if (imagen) await guardarImagenHistorico(imagen)
}

export async function ejecutarAnalisisCompleto(): Promise<{
  procesados: number
  error?: string
}> {
  try {
    const politicos = await getPoliticos(true)
    if (politicos.length === 0) return { procesados: 0 }

    const todasKeywords = [...new Set(politicos.flatMap(p => p.palabrasClave))].slice(0, 6)

    const [rssItems, googleItems] = await Promise.all([
      fetchAllRSSFeeds(),
      fetchNewsForKeywords(todasKeywords),
    ])
    const todasNoticias = [...rssItems, ...googleItems]

    for (const politico of politicos) {
      await analizarPolitico(politico.id, politico.palabrasClave, todasNoticias)

      // Facebook: analizar si tiene pageId configurado
      if (politico.facebookPageId) {
        const fbPosts = await fetchFacebookPosts(politico.facebookPageId)
        if (fbPosts.length > 0) {
          const fbMenciones: Omit<Mencion, 'id'>[] = fbPosts.map(post => ({
            politicoId: politico.id,
            fuente: 'facebook',
            titulo: post.titulo,
            url: post.url,
            sentimiento: post.sentimientoFinal.sentimiento,
            score: post.sentimientoFinal.score,
            publicadoAt: post.publicadoAt,
          }))
          await guardarMenciones(fbMenciones)
        }
      }

      // Ad Library: avisos políticos de Facebook
      const avisos = await fetchAvisosPoliticos(politico.nombre)
      if (avisos.length > 0) {
        await guardarAvisos(politico.id, avisos)
        // Los avisos también influyen en sentimiento (texto del aviso)
        const avisosMenciones: Omit<Mencion, 'id'>[] = avisos.map(a => ({
          politicoId: politico.id,
          fuente: 'facebook_ad',
          titulo: a.texto,
          url: a.urlPreview,
          sentimiento: analizarPorKeywords(a.texto).sentimiento,
          score: analizarPorKeywords(a.texto).score,
          publicadoAt: a.fechaInicio ?? new Date().toISOString(),
        }))
        await guardarMenciones(avisosMenciones)
      }

      // Instagram via Apify
      if (politico.instagramUsername) {
        const igPosts = await fetchInstagramPosts(politico.instagramUsername)
        if (igPosts.length > 0) {
          const igMenciones: Omit<Mencion, 'id'>[] = igPosts.map(p => ({
            politicoId: politico.id,
            fuente: 'instagram',
            titulo: p.titulo,
            url: p.url,
            sentimiento: p.sentimiento.sentimiento,
            score: p.sentimiento.score,
            publicadoAt: p.publicadoAt,
          }))
          await guardarMenciones(igMenciones)
        }
      }

      // Google Trends
      const trends = await fetchGoogleTrends(politico.nombre, politico.palabrasClave)
      if (trends) {
        await guardarTendencia(politico.id, 'google_trends', trends.interesActual, trends.porProvincia.length)
      }

      // YouTube comentarios
      const ytData = await fetchYouTubeData(politico.nombre, politico.palabrasClave)
      if (ytData && ytData.comentarios.length > 0) {
        const ytMenciones: Omit<Mencion, 'id'>[] = ytData.comentarios.map(c => ({
          politicoId: politico.id,
          fuente: 'youtube',
          titulo: c.texto,
          url: null,
          sentimiento: c.sentimiento.sentimiento,
          score: c.sentimiento.score,
          publicadoAt: c.publicadoAt,
        }))
        await guardarMenciones(ytMenciones)
        await guardarTendencia(politico.id, 'youtube', Math.round(ytData.scorePromedio * 100), ytData.totalVideos)
      }

      // Pequeña pausa entre políticos
      await new Promise(r => setTimeout(r, 500))
    }

    return { procesados: politicos.length }
  } catch (e) {
    return { procesados: 0, error: String(e) }
  }
}
