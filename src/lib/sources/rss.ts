import Parser from 'rss-parser'

export interface RSSFeed {
  nombre: string
  url: string
  region: 'nacional' | 'santa-cruz' | 'patagonia'
}

export const RSS_FEEDS: RSSFeed[] = [
  { nombre: 'Infobae', url: 'https://www.infobae.com/feeds/rss/', region: 'nacional' },
  { nombre: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', region: 'nacional' },
  { nombre: 'Clarín Política', url: 'https://www.clarin.com/rss/politica/', region: 'nacional' },
  { nombre: 'Página 12', url: 'https://www.pagina12.com.ar/rss/secciones/el-pais/notas', region: 'nacional' },
  { nombre: 'Télam', url: 'https://www.telam.com.ar/rss/politica.xml', region: 'nacional' },
  { nombre: 'OPI Santa Cruz', url: 'https://opisantacruz.com.ar/feed/', region: 'santa-cruz' },
  { nombre: 'El Diario del Fin del Mundo', url: 'https://eldiariodelfinmundo.com/feed/', region: 'patagonia' },
]

export interface NewsItem {
  titulo: string
  url: string | null
  publicadoAt: string
  fuente: string
}

export async function fetchRSSFeed(feed: RSSFeed): Promise<NewsItem[]> {
  const parser = new Parser({ timeout: 10000 })
  try {
    const parsed = await parser.parseURL(feed.url)
    return (parsed.items ?? []).map(item => ({
      titulo: item.title ?? '',
      url: item.link ?? null,
      publicadoAt: item.pubDate ?? new Date().toISOString(),
      fuente: 'rss',
    })).filter(item => item.titulo.length > 0)
  } catch {
    return []
  }
}

export async function fetchAllRSSFeeds(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(RSS_FEEDS.map(fetchRSSFeed))
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}
