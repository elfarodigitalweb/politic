import type { Partido, Provincia, Municipio, GeoJSONFeatureProperties } from '../mapa'

describe('mapa types', () => {
  it('Partido tiene los campos requeridos', () => {
    const partido: Partido = {
      id: 1,
      nombre: 'PJ',
      slug: 'pj',
      color: '#003087',
      esPersonalizado: false,
    }
    expect(partido.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('Provincia tiene código INDEC de 2 dígitos', () => {
    const provincia: Provincia = {
      id: 1,
      nombre: 'Santa Cruz',
      slug: 'santa-cruz',
      codigoIndec: '26',
      gobernadorNombre: 'Claudio Vidal',
      partidoSlug: 'pj',
      partidoColor: '#003087',
    }
    expect(provincia.codigoIndec).toMatch(/^\d{2}$/)
  })

  it('Municipio acepta imagen null', () => {
    const municipio: Municipio = {
      id: 1,
      nombre: 'Río Gallegos',
      slug: 'rio-gallegos',
      provinciaSlug: 'santa-cruz',
      intendenteNombre: null,
      partidoSlug: null,
      partidoColor: '#94a3b8',
      imagenPositiva: null,
      imagenNegativa: null,
    }
    expect(municipio.imagenPositiva).toBeNull()
  })

  it('GeoJSONFeatureProperties tiene nombre y slug requeridos', () => {
    const props: GeoJSONFeatureProperties = {
      nombre: 'Santa Cruz',
      slug: 'santa-cruz',
    }
    expect(props.codigoIndec).toBeUndefined()
    expect(props.nombre).toBeDefined()
  })
})
