import { getColorPartido, PARTIDOS_PRINCIPALES, LISTA_PARTIDOS } from '../partidos'

describe('partidos', () => {
  it('devuelve color hardcodeado para pj', () => {
    expect(getColorPartido('pj')).toBe('#003087')
  })

  it('devuelve color hardcodeado para pro', () => {
    expect(getColorPartido('pro')).toBe('#FFD700')
  })

  it('devuelve color hardcodeado para ucr', () => {
    expect(getColorPartido('ucr')).toBe('#DC2626')
  })

  it('devuelve color hardcodeado para la-libertad-avanza', () => {
    expect(getColorPartido('la-libertad-avanza')).toBe('#7C3AED')
  })

  it('devuelve gris #94a3b8 para partido desconocido', () => {
    expect(getColorPartido('partido-inexistente')).toBe('#94a3b8')
  })

  it('devuelve gris para null', () => {
    expect(getColorPartido(null)).toBe('#94a3b8')
  })

  it('devuelve gris para undefined', () => {
    expect(getColorPartido(undefined)).toBe('#94a3b8')
  })

  it('PARTIDOS_PRINCIPALES tiene al menos 5 entradas', () => {
    expect(Object.keys(PARTIDOS_PRINCIPALES).length).toBeGreaterThanOrEqual(5)
  })

  it('LISTA_PARTIDOS tiene al menos 5 partidos con nombre, slug y color', () => {
    expect(LISTA_PARTIDOS.length).toBeGreaterThanOrEqual(5)
    LISTA_PARTIDOS.forEach(p => {
      expect(p.slug).toBeTruthy()
      expect(p.nombre).toBeTruthy()
      expect(p.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})
