// Apify Instagram Scraper — Free tier: $5/mes de créditos
// Actor: apify/instagram-scraper
// Token: crear cuenta gratis en apify.com → Settings → Integrations → API token

import type { Sentimiento } from '@/types/imagen'
import { analizarPorKeywords } from '@/lib/sentiment/huggingface'

export interface InstagramPost {
  titulo: string
  url: string
  publicadoAt: string
  likes: number
  comentarios: number
  sentimiento: { sentimiento: Sentimiento; score: number }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseInstagramPost(item: any): InstagramPost | null {
  const caption = item.caption ?? item.alt ?? ''
  if (!caption && !item.url) return null

  return {
    titulo: caption.slice(0, 300) || 'Post de Instagram',
    url: item.url ?? item.shortCode ? `https://instagram.com/p/${item.shortCode}` : '',
    publicadoAt: item.timestamp ?? item.takenAt ?? new Date().toISOString(),
    likes: item.likesCount ?? item.likes ?? 0,
    comentarios: item.commentsCount ?? item.comments ?? 0,
    sentimiento: analizarPorKeywords(caption),
  }
}

export async function fetchInstagramPosts(username: string): Promise<InstagramPost[]> {
  const token = process.env.APIFY_API_TOKEN
  if (!token) return []

  // Usar el dataset de Apify con run sincrónico (timeout 30s)
  const actorId = 'apify~instagram-scraper'
  const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}&timeout=30`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: 'posts',
        resultsLimit: 15,
      }),
      signal: AbortSignal.timeout(35000),
    })

    if (!res.ok) return []
    const data = await res.json() as unknown[]
    if (!Array.isArray(data)) return []

    return data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => parseInstagramPost(item))
      .filter((p): p is InstagramPost => p !== null)
  } catch {
    return []
  }
}
