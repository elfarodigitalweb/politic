import { detectarProvincias, PROVINCE_KEYWORDS, getProvinciaNombre } from '../provincial'

describe('provincial classifier', () => {
  it('detecta Santa Cruz por keyword en titular', () => {
    const provincias = detectarProvincias('Claudio Vidal recorre el interior de Santa Cruz', 'nacional')
    expect(provincias).toContain('santa-cruz')
  })

  it('incluye siempre la provincia de la fuente', () => {
    const provincias = detectarProvincias('Noticia sin keywords específicas', 'santa-cruz')
    expect(provincias).toContain('santa-cruz')
  })

  it('detecta múltiples provincias en un titular', () => {
    const provincias = detectarProvincias('Acuerdo entre Córdoba y Mendoza por recursos', 'nacional')
    expect(provincias).toContain('cordoba')
    expect(provincias).toContain('mendoza')
  })

  it('retorna nacional si no hay matches de keyword', () => {
    const provincias = detectarProvincias('Noticia sin mención provincial', 'nacional')
    expect(provincias).toContain('nacional')
  })

  it('PROVINCE_KEYWORDS cubre las provincias clave', () => {
    expect(PROVINCE_KEYWORDS['santa-cruz']).toBeDefined()
    expect(PROVINCE_KEYWORDS['buenos-aires']).toBeDefined()
    expect(PROVINCE_KEYWORDS['cordoba']).toBeDefined()
    expect(Object.keys(PROVINCE_KEYWORDS).length).toBeGreaterThanOrEqual(10)
  })

  it('getProvinciaNombre retorna nombre legible', () => {
    expect(getProvinciaNombre('santa-cruz')).toBe('Santa Cruz')
    expect(getProvinciaNombre('slug-inexistente')).toBe('Nacional')
  })
})
