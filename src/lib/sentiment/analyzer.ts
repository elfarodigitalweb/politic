import { fetchAllRSSFeeds } from '@/lib/sources/rss'
import { fetchNewsForKeywords } from '@/lib/sources/googleNews'
import { analyzeSentiment } from './huggingface'
import {
  getPoliticos,
  guardarMenciones,
  guardarImagenHistorico,
  calcularImagenActual,
} from '@/lib/supabase/politicos-queries'
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
    }

    return { procesados: politicos.length }
  } catch (e) {
    return { procesados: 0, error: String(e) }
  }
}
