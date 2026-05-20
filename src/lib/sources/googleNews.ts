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

// Normaliza un input cualquiera ("https://www.opisantacruz.com.ar/seccion") a "opisantacruz.com.ar"
export function normalizarDominio(input: string): string {
  let dominio = input.trim().toLowerCase()
  dominio = dominio.replace(/^https?:\/\//, '')
  dominio = dominio.replace(/^www\./, '')
  dominio = dominio.split('/')[0]
  dominio = dominio.split('?')[0]
  return dominio
}

// Busca noticias recientes de un sitio sin RSS usando Google News con site:dominio
// El operador `site:` instruye a Google a devolver solo URLs de ese dominio.
// La fuente en el resultado lleva el nombre del medio (no "google_news") para que
// el scanner de SC lo trate como fuente local y no filtre por localidad en el título.
export async function fetchGoogleNewsForSite(
  dominio: string,
  nombreMedio: string
): Promise<NewsItem[]> {
  const dominioNorm = normalizarDominio(dominio)
  if (!dominioNorm || !dominioNorm.includes('.')) return []

  const parser = new Parser({ timeout: 10000 })
  try {
    const url = buildGoogleNewsUrl(`site:${dominioNorm}`)
    const parsed = await parser.parseURL(url)
    const recent = filterRecentItems(parsed.items ?? [], 14)
    return recent
      .map(item => ({
        titulo: extractText(item.title ?? ''),
        url: item.link ?? null,
        publicadoAt: item.pubDate ?? new Date().toISOString(),
        fuente: nombreMedio,
      }))
      .filter(item => item.titulo.length > 0)
  } catch {
    return []
  }
}
