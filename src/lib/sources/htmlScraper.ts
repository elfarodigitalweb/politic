// Scraper HTML genérico para sitios de noticias sin RSS y mal indexados en Google News.
// Estrategia heurística (no requiere selectores por sitio):
//   1. Fetch del HTML con timeout.
//   2. Cheerio busca todos los <a> dentro de <h1>/<h2>/<h3> o con clases típicas
//      de tarjetas de noticia (article, post, news, nota, titular, headline).
//   3. Filtra: links del mismo host, título ≥ 15 chars, dedupe.
//   4. Devuelve hasta 30 items ordenados por orden de aparición.

import * as cheerio from 'cheerio'
import type { NewsItem } from './rss'

const TIMEOUT_MS = 8000
const MAX_ITEMS = 30
const MIN_TITULO = 15

export async function fetchSiteViaScraping(
  urlScraping: string,
  nombreMedio: string
): Promise<NewsItem[]> {
  if (!urlScraping) return []

  let host: string
  try {
    host = new URL(urlScraping).host.replace(/^www\./, '')
  } catch {
    return []
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let html: string
  try {
    const res = await fetch(urlScraping, {
      signal: controller.signal,
      headers: {
        // User-Agent normal — algunos sitios bloquean defaults raros
        'User-Agent':
          'Mozilla/5.0 (compatible; PortalPoliticoBot/1.0; +https://politic-sage.vercel.app)',
        'Accept': 'text/html',
      },
    })
    if (!res.ok) return []
    html = await res.text()
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }

  const $ = cheerio.load(html)
  const items: NewsItem[] = []
  const urlsVistas = new Set<string>()
  const ahoraISO = new Date().toISOString()

  // Selectores heurísticos comunes en sitios de noticias
  const selectores = [
    'h1 a[href]',
    'h2 a[href]',
    'h3 a[href]',
    'article a[href]',
    '[class*="article" i] a[href]',
    '[class*="post" i] a[href]',
    '[class*="news" i] a[href]',
    '[class*="nota" i] a[href]',
    '[class*="titular" i] a[href]',
    '[class*="headline" i] a[href]',
    '[class*="card" i] a[href]',
  ]

  for (const sel of selectores) {
    $(sel).each((_, el) => {
      if (items.length >= MAX_ITEMS) return false

      const $a = $(el)
      const hrefRaw = ($a.attr('href') ?? '').trim()
      if (!hrefRaw || hrefRaw.startsWith('#') || hrefRaw.startsWith('javascript:')) return

      // Normalizar URL absoluta
      let urlAbs: string
      try {
        urlAbs = new URL(hrefRaw, urlScraping).toString()
      } catch {
        return
      }

      // Quedarse solo con links del mismo host
      try {
        const linkHost = new URL(urlAbs).host.replace(/^www\./, '')
        if (linkHost !== host) return
      } catch {
        return
      }

      if (urlsVistas.has(urlAbs)) return
      urlsVistas.add(urlAbs)

      // Título: texto del <a>, sin tags, normalizado
      const titulo = $a.text().replace(/\s+/g, ' ').trim()
      if (titulo.length < MIN_TITULO) return

      // Descartar links de menú/secciones cortos repetidos
      if (/^(inicio|home|noticias|secciones|contacto|about|nosotros)$/i.test(titulo)) return

      items.push({
        titulo,
        url: urlAbs,
        publicadoAt: ahoraISO, // sin fecha real en HTML — usamos "ahora" como aproximación
        fuente: nombreMedio,
      })
    })
    if (items.length >= MAX_ITEMS) break
  }

  return items
}
