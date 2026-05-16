import Parser from 'rss-parser'

export interface RSSFeed {
  nombre: string
  url: string
  region: 'nacional' | 'santa-cruz' | 'patagonia'
}

export interface NewsItem {
  titulo: string
  url: string | null
  publicadoAt: string
  fuente: string
  region?: string
}

// ---------------------------------------------------------------
// Feeds hardcodeados — nacionales + SC/Patagonia
// ---------------------------------------------------------------
export const RSS_FEEDS: RSSFeed[] = [
  // === NACIONALES ===
  { nombre: 'Infobae',           url: 'https://www.infobae.com/feeds/rss/',                                region: 'nacional' },
  { nombre: 'Infobae Política',  url: 'https://www.infobae.com/tag/politica/rss/',                        region: 'nacional' },
  { nombre: 'La Nación',         url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/',               region: 'nacional' },
  { nombre: 'La Nación Política',url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/?_website=la-nacion&from=0&size=10&section=/politica', region: 'nacional' },
  { nombre: 'Clarín',            url: 'https://www.clarin.com/rss/lo-ultimo/',                            region: 'nacional' },
  { nombre: 'Clarín Política',   url: 'https://www.clarin.com/rss/politica/',                             region: 'nacional' },
  { nombre: 'Página 12',         url: 'https://www.pagina12.com.ar/rss/secciones/el-pais/notas',          region: 'nacional' },
  { nombre: 'Télam',             url: 'https://www.telam.com.ar/rss/politica.xml',                        region: 'nacional' },
  { nombre: 'Perfil',            url: 'https://www.perfil.com/feed/',                                     region: 'nacional' },
  { nombre: 'Ambito Político',   url: 'https://www.ambito.com/rss/pages/politica.xml',                    region: 'nacional' },
  { nombre: 'TN',                url: 'https://tn.com.ar/rss/',                                            region: 'nacional' },
  { nombre: 'El Cronista',       url: 'https://www.cronista.com/rss/',                                     region: 'nacional' },
  { nombre: 'El Destape',        url: 'https://www.eldestapeweb.com/rss/',                                region: 'nacional' },
  { nombre: 'La Política Online',url: 'https://www.lapoliticaonline.com/feed/',                           region: 'nacional' },
  { nombre: 'Urgente24',         url: 'https://urgente24.com/feed/',                                       region: 'nacional' },
  { nombre: 'MDZ',               url: 'https://www.mdzol.com/rss/',                                        region: 'nacional' },

  // === SANTA CRUZ / PATAGONIA ===
  { nombre: 'OPI Santa Cruz',           url: 'https://opisantacruz.com.ar/feed/',                         region: 'santa-cruz' },
  { nombre: 'La Opinión Austral',        url: 'https://laopinionaustral.com.ar/feed/',                    region: 'santa-cruz' },
  { nombre: 'El Diario del Fin del Mundo', url: 'https://eldiariodelfinmundo.com/feed/',                  region: 'santa-cruz' },
  { nombre: 'Tiempo Sur',               url: 'https://www.tiemposur.com.ar/feed/',                        region: 'santa-cruz' },
  { nombre: 'Diario Nuevo Día',         url: 'https://www.eldiarionuevodia.com.ar/feed/',                  region: 'santa-cruz' },
  { nombre: 'Infosur',                  url: 'https://www.infosur.info/feed/',                            region: 'patagonia'  },
  { nombre: 'El Patagónico',            url: 'https://www.elpatagonico.com/rss/',                         region: 'patagonia'  },
  { nombre: 'ADN Sur',                  url: 'https://www.adnsur.com.ar/rss/',                            region: 'patagonia'  },
]

// Medios SC para detección prioritaria de localidades
export const FUENTES_SC = new Set(
  RSS_FEEDS.filter(f => f.region !== 'nacional').map(f => f.nombre)
)

// ---------------------------------------------------------------
// Fetch individual
// ---------------------------------------------------------------
async function fetchRSSFeed(feed: RSSFeed): Promise<NewsItem[]> {
  const parser = new Parser({ timeout: 8000 })
  try {
    const parsed = await parser.parseURL(feed.url)
    return (parsed.items ?? [])
      .map(item => ({
        titulo: item.title ?? '',
        url: item.link ?? null,
        publicadoAt: item.pubDate ?? new Date().toISOString(),
        fuente: feed.nombre,
        region: feed.region,
      }))
      .filter(item => item.titulo.length > 10)
  } catch {
    return []  // silencioso — no romper el análisis si un feed falla
  }
}

// ---------------------------------------------------------------
// Fetch todos los feeds (hardcoded + dinámicos desde medios_locales)
// ---------------------------------------------------------------
export async function fetchAllRSSFeeds(extraFeeds: RSSFeed[] = []): Promise<NewsItem[]> {
  const allFeeds = [...RSS_FEEDS, ...extraFeeds]
  const results = await Promise.allSettled(allFeeds.map(fetchRSSFeed))
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}

// Solo feeds SC (útil para el scanner de alertas)
export async function fetchFeedsSantaCruz(extraFeeds: RSSFeed[] = []): Promise<NewsItem[]> {
  const scFeeds = [...RSS_FEEDS.filter(f => f.region !== 'nacional'), ...extraFeeds]
  const results = await Promise.allSettled(scFeeds.map(fetchRSSFeed))
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}

// Convertir un MedioLocal (de la DB) a RSSFeed
export function medioToFeed(medio: { nombre: string; urlRss: string; provinciaSlug?: string }): RSSFeed {
  return {
    nombre: medio.nombre,
    url: medio.urlRss,
    region: medio.provinciaSlug === 'santa-cruz' ? 'santa-cruz' : 'patagonia',
  }
}
