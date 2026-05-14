import type { Sentimiento } from '@/types/imagen'
import { analizarPorKeywords } from '@/lib/sentiment/huggingface'

const FB_API_VERSION = 'v19.0'
const FB_BASE = `https://graph.facebook.com/${FB_API_VERSION}`

export function buildAppToken(appId: string, appSecret: string): string {
  return `${appId}|${appSecret}`
}

export function buildFacebookPageUrl(pageId: string, accessToken: string): string {
  const fields = [
    'message',
    'story',
    'created_time',
    'reactions.type(LIKE).summary(total_count).as(like_count)',
    'reactions.type(LOVE).summary(total_count).as(love_count)',
    'reactions.type(ANGRY).summary(total_count).as(angry_count)',
    'reactions.type(SAD).summary(total_count).as(sad_count)',
  ].join(',')

  return `${FB_BASE}/${pageId}/posts?fields=${encodeURIComponent(fields)}&limit=20&access_token=${accessToken}`
}

interface ReactionCounts {
  like: number
  love: number
  angry: number
  sad: number
}

export function calcularSentimientoReacciones(
  reactions: ReactionCounts
): { sentimiento: Sentimiento; score: number } {
  const positivas = reactions.like + reactions.love
  const negativas = reactions.angry + reactions.sad
  const total = positivas + negativas

  if (total === 0) return { sentimiento: 'neutral', score: 0 }
  if (positivas > negativas) {
    return { sentimiento: 'positivo', score: positivas / total }
  }
  if (negativas > positivas) {
    return { sentimiento: 'negativo', score: negativas / total }
  }
  return { sentimiento: 'neutral', score: 0.5 }
}

export interface FacebookPost {
  titulo: string
  url: string
  publicadoAt: string
  sentimientoTexto: { sentimiento: Sentimiento; score: number }
  sentimientoReacciones: { sentimiento: Sentimiento; score: number }
  // Sentimiento combinado: 60% reacciones + 40% texto
  sentimientoFinal: { sentimiento: Sentimiento; score: number }
}

function combinarSentimientos(
  texto: { sentimiento: Sentimiento; score: number },
  reacciones: { sentimiento: Sentimiento; score: number }
): { sentimiento: Sentimiento; score: number } {
  const SCORE_MAP: Record<Sentimiento, number> = {
    positivo: 1,
    neutral: 0,
    negativo: -1,
  }

  // Si hay reacciones significativas, pesan 60%; si no, solo texto
  const pesoReacciones = reacciones.score > 0 ? 0.6 : 0
  const pesoTexto = 1 - pesoReacciones

  const scoreNumerico =
    SCORE_MAP[reacciones.sentimiento] * pesoReacciones * reacciones.score +
    SCORE_MAP[texto.sentimiento] * pesoTexto * texto.score

  if (scoreNumerico > 0.1) return { sentimiento: 'positivo', score: Math.min(scoreNumerico, 1) }
  if (scoreNumerico < -0.1) return { sentimiento: 'negativo', score: Math.min(-scoreNumerico, 1) }
  return { sentimiento: 'neutral', score: 0.5 }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePost(item: any, pageId: string): FacebookPost {
  const texto = item.message || item.story || ''
  const createdTime = item.created_time ?? new Date().toISOString()

  const likeCount = item.like_count?.summary?.total_count ?? 0
  const loveCount = item.love_count?.summary?.total_count ?? 0
  const angryCount = item.angry_count?.summary?.total_count ?? 0
  const sadCount = item.sad_count?.summary?.total_count ?? 0

  const sentimientoTexto = analizarPorKeywords(texto)
  const sentimientoReacciones = calcularSentimientoReacciones({
    like: likeCount,
    love: loveCount,
    angry: angryCount,
    sad: sadCount,
  })

  return {
    titulo: texto.slice(0, 200) || 'Post de Facebook',
    url: `https://facebook.com/${pageId}`,
    publicadoAt: createdTime,
    sentimientoTexto,
    sentimientoReacciones,
    sentimientoFinal: combinarSentimientos(sentimientoTexto, sentimientoReacciones),
  }
}

export async function fetchFacebookPosts(pageId: string): Promise<FacebookPost[]> {
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET

  if (!appId || !appSecret) return []

  const accessToken = buildAppToken(appId, appSecret)
  const url = buildFacebookPageUrl(pageId, accessToken)

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    })

    if (!res.ok) return []

    const data = await res.json() as { data?: unknown[] }
    if (!Array.isArray(data.data)) return []

    return data.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => parsePost(item, pageId))
      .filter(post => post.titulo.length > 10)
  } catch {
    return []
  }
}
