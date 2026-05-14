import { mapPoliticoRow, mapImagenRow, calcularImagenActual } from '../politicos-queries'

describe('politicos-queries', () => {
  it('mapPoliticoRow transforma row DB a Politico', () => {
    const row = {
      id: 1, nombre: 'Claudio Vidal', slug: 'claudio-vidal',
      cargo: 'gobernador', provincia_slug: 'santa-cruz',
      palabras_clave: ['Claudio Vidal', 'gobernador Santa Cruz'],
      en_testeo: false, activo: true,
      partido_nombre: 'PJ', partido_color: '#003087',
      foto_url: null, facebook_page_id: null, instagram_username: null,
    }
    const result = mapPoliticoRow(row)
    expect(result.slug).toBe('claudio-vidal')
    expect(result.palabrasClave).toHaveLength(2)
    expect(result.partidoColor).toBe('#003087')
    expect(result.enTesteo).toBe(false)
  })

  it('mapPoliticoRow usa color default cuando partido_color es null', () => {
    const row = {
      id: 2, nombre: 'Test', slug: 'test', cargo: 'otro',
      provincia_slug: 'santa-cruz', palabras_clave: [],
      en_testeo: false, activo: true,
      partido_nombre: null, partido_color: null,
      foto_url: null, facebook_page_id: null, instagram_username: null,
    }
    expect(mapPoliticoRow(row).partidoColor).toBe('#94a3b8')
  })

  it('calcularImagenActual retorna null si no hay menciones pos/neg', () => {
    expect(calcularImagenActual(1, [])).toBeNull()
    const soloNeutral = [{ sentimiento: 'neutral' as const }]
    expect(calcularImagenActual(1, soloNeutral)).toBeNull()
  })

  it('calcularImagenActual calcula % correctamente', () => {
    const menciones = [
      { sentimiento: 'positivo' as const },
      { sentimiento: 'positivo' as const },
      { sentimiento: 'negativo' as const },
      { sentimiento: 'neutral' as const },
    ]
    const result = calcularImagenActual(1, menciones)
    expect(result).not.toBeNull()
    expect(result!.imagenPositiva).toBeCloseTo(66.67, 1)
    expect(result!.imagenNegativa).toBeCloseTo(33.33, 1)
    expect(result!.totalMenciones).toBe(4)
  })

  it('mapImagenRow transforma row DB', () => {
    const row = {
      id: 1, politico_id: 1,
      imagen_positiva: '65.50', imagen_negativa: '34.50',
      total_menciones: 20, calculado_at: '2026-01-01T00:00:00Z'
    }
    const result = mapImagenRow(row)
    expect(result.imagenPositiva).toBe(65.5)
    expect(result.politicoId).toBe(1)
  })
})
