// YouTube Data API v3 — 10.000 unidades/día gratuitas
// API Key: console.cloud.google.com → Enable YouTube Data API v3 → Create credentials

import { analizarPorKeywords } from '@/lib/sentiment/huggingface'
import type { Sentimiento } from '@/types/imagen'

const YT_BASE = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeComentario {
  texto: string
  likes: number
  publicadoAt: string
  sentimiento: { sentimiento: Sentimiento; score: number }
}

export interface YouTubeData {
  totalVideos: number
  comentarios: YouTubeComentario[]
  sentimientoPromedio: Sentimiento
  scorePromedio: number
}

async function searchVideos(keyword: string, apiKey: string): Promise<string[]> {
  const params = new URLSearchParams({
    part: 'id',
    q: keyword,
    type: 'video',
    order: 'date',
    regionCode: 'AR',
    relevanceLanguage: 'es',
    maxResults: '5',
    key: apiKey,
  })

  const res = await fetch(`${YT_BASE}/search?${params}`, {
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return []
  const data = await res.json() as { items?: { id: { videoId: string } }[] }
  return (data.items ?? []).map(item => item.id.videoId)
}

async function getVideoComments(videoId: string, apiKey: string): Promise<YouTubeComentario[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    videoId,
    maxResults: '20',
    order: 'relevance',
    key: apiKey,
  })

  try {
    const res = await fetch(`${YT_BASE}/commentThreads?${params}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const data = await res.json() as {
      items?: { snippet: { topLevelComment: { snippet: { textDisplay: string; likeCount: number; publishedAt: string } } } }[]
    }

    return (data.items ?? []).map(item => {
      const snippet = item.snippet.topLevelComment.snippet
      const texto = snippet.textDisplay.replace(/<[^>]+>/g, ' ').trim()
      return {
        texto,
        likes: snippet.likeCount,
        publicadoAt: snippet.publishedAt,
        sentimiento: analizarPorKeywords(texto),
      }
    })
  } catch {
    return []
  }
}

export async function fetchYouTubeData(
  nombre: string,
  keywords: string[]
): Promise<YouTubeData | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  const keyword = `${keywords[0] ?? nombre} Argentina`

  try {
    const videoIds = await searchVideos(keyword, apiKey)
    if (videoIds.length === 0) return null

    const comentariosPorVideo = await Promise.all(
      videoIds.slice(0, 3).map(id => getVideoComments(id, apiKey))
    )
    const comentarios = comentariosPorVideo.flat()
    if (comentarios.length === 0) return { totalVideos: videoIds.length, comentarios: [], sentimientoPromedio: 'neutral', scorePromedio: 0 }

    const positivos = comentarios.filter(c => c.sentimiento.sentimiento === 'positivo').length
    const negativos = comentarios.filter(c => c.sentimiento.sentimiento === 'negativo').length
    const total = positivos + negativos

    let sentimientoPromedio: Sentimiento = 'neutral'
    if (total > 0) {
      sentimientoPromedio = positivos > negativos ? 'positivo' : negativos > positivos ? 'negativo' : 'neutral'
    }

    const scorePromedio = comentarios.reduce((sum, c) => sum + c.sentimiento.score, 0) / comentarios.length

    return {
      totalVideos: videoIds.length,
      comentarios,
      sentimientoPromedio,
      scorePromedio,
    }
  } catch {
    return null
  }
}
