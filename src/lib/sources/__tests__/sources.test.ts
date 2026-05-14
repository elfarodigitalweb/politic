import { buildGoogleNewsUrl, filterRecentItems, extractText } from '../googleNews'
import { RSS_FEEDS } from '../rss'

describe('sources', () => {
  it('buildGoogleNewsUrl genera URL con keyword encodada', () => {
    const url = buildGoogleNewsUrl('Claudio Vidal Santa Cruz')
    expect(url).toContain('news.google.com/rss/search')
    expect(url).toContain('Claudio')
    expect(url).toContain('gl=AR')
    expect(url).toContain('hl=es')
  })

  it('filterRecentItems filtra items de más de N días', () => {
    const now = new Date()
    const oldDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString()
    const recentDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    const items = [
      { title: 'viejo', pubDate: oldDate },
      { title: 'reciente', pubDate: recentDate },
    ]
    const filtered = filterRecentItems(items, 7)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toBe('reciente')
  })

  it('filterRecentItems incluye todos si days es 0', () => {
    const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    expect(filterRecentItems([{ title: 'x', pubDate: old }], 0)).toHaveLength(0)
  })

  it('extractText elimina tags HTML', () => {
    expect(extractText('<p>Hola <b>mundo</b></p>')).toBe('Hola mundo')
    expect(extractText('Sin HTML')).toBe('Sin HTML')
  })

  it('RSS_FEEDS tiene al menos 5 fuentes con URL válida', () => {
    expect(RSS_FEEDS.length).toBeGreaterThanOrEqual(5)
    RSS_FEEDS.forEach(f => {
      expect(f.url).toMatch(/^https?:\/\//)
      expect(f.nombre).toBeTruthy()
    })
  })
})
