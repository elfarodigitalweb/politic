import { buildNoticiaId, sortByDate, limitNoticias } from '../aggregator'
import type { NoticiaItem } from '@/types/noticias'

const makeNoticia = (titulo: string, publicadoAt: string): NoticiaItem => ({
  id: buildNoticiaId(titulo + publicadoAt),
  titulo,
  url: `https://ejemplo.com/${titulo}`,
  fuente: 'Test',
  provinciaSlug: 'nacional',
  provinciaNombre: 'Nacional',
  publicadoAt,
})

describe('aggregator', () => {
  it('buildNoticiaId genera ID distinto para inputs distintos', () => {
    expect(buildNoticiaId('url-a')).not.toBe(buildNoticiaId('url-b'))
  })

  it('buildNoticiaId es determinístico', () => {
    expect(buildNoticiaId('misma-url')).toBe(buildNoticiaId('misma-url'))
  })

  it('buildNoticiaId retorna string no vacío', () => {
    expect(buildNoticiaId('test').length).toBeGreaterThan(0)
  })

  it('sortByDate ordena descendente', () => {
    const items = [
      makeNoticia('viejo', '2026-01-01T00:00:00Z'),
      makeNoticia('nuevo', '2026-05-14T00:00:00Z'),
      makeNoticia('medio', '2026-03-01T00:00:00Z'),
    ]
    const sorted = sortByDate(items)
    expect(sorted[0].titulo).toBe('nuevo')
    expect(sorted[2].titulo).toBe('viejo')
  })

  it('limitNoticias retorna primeros N elementos', () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      makeNoticia(`noticia-${i}`, '2026-01-01T00:00:00Z')
    )
    expect(limitNoticias(items, 10)).toHaveLength(10)
    expect(limitNoticias(items, 100)).toHaveLength(20)
  })
})
