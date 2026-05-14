import Parser from 'rss-parser'
import type { NewsItem } from './rss'

export function buildGoogleNewsUrl(keyword: string): string {
  const encoded = encodeURIComponent(keyword)
  return `https://news.google.com/rss/search?q=${encoded}&hl=es-419&gl=AR&ceid=AR:es`
}

export function filterRecentItems<T extends { pubDate?: string; title?: string }>(
  items: T[],
  days: number
): T[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return items.filter(item => {
    const date = item.pubDate ? new Date(item.pubDate).getTime() : 0
    return date > cutoff
  })
}

export function extractText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function fetchGoogleNewsForKeyword(keyword: string): Promise<NewsItem[]> {
  const parser = new Parser({ timeout: 10000 })
  try {
    const url = buildGoogleNewsUrl(keyword)
    const parsed = await parser.parseURL(url)
    const recent = filterRecentItems(parsed.items ?? [], 7)
    return recent.map(item => ({
      titulo: extractText(item.title ?? ''),
      url: item.link ?? null,
      publicadoAt: item.pubDate ?? new Date().toISOString(),
      fuente: 'google_news',
    })).filter(item => item.titulo.length > 0)
  } catch {
    return []
  }
}

export async function fetchNewsForKeywords(keywords: string[]): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    keywords.slice(0, 3).map(fetchGoogleNewsForKeyword)
  )
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
  // Deduplicar por URL
  const seen = new Set<string>()
  return all.filter(item => {
    if (!item.url) return true
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}
