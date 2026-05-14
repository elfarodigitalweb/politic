import { filtrarPorKeywords, deduplicate } from '../analyzer'

describe('analyzer', () => {
  it('filtrarPorKeywords retorna items que contienen alguna keyword (case insensitive)', () => {
    const items = [
      { titulo: 'Claudio Vidal anuncia obras en Santa Cruz' },
      { titulo: 'El intendente de Rosario habla de economía' },
      { titulo: 'VIDAL recorre el interior provincial' },
    ]
    const result = filtrarPorKeywords(items, ['Claudio Vidal', 'vidal'])
    expect(result).toHaveLength(2)
  })

  it('filtrarPorKeywords retorna vacío si ninguna keyword coincide', () => {
    const items = [{ titulo: 'Noticia de Mendoza sin relación' }]
    expect(filtrarPorKeywords(items, ['Claudio Vidal'])).toHaveLength(0)
  })

  it('deduplicate elimina por título normalizado', () => {
    const items = [
      { titulo: 'Vidal habla sobre Santa Cruz', url: 'http://a.com' },
      { titulo: 'Vidal habla sobre Santa Cruz', url: 'http://b.com' },
      { titulo: 'Grasso en Río Gallegos', url: 'http://c.com' },
    ]
    expect(deduplicate(items)).toHaveLength(2)
  })

  it('deduplicate mantiene el primer item duplicado', () => {
    const items = [
      { titulo: 'Duplicado', url: 'http://primero.com' },
      { titulo: 'Duplicado', url: 'http://segundo.com' },
    ]
    const result = deduplicate(items)
    expect(result[0].url).toBe('http://primero.com')
  })
})
