import { mapProvinciasToMap, mapMunicipiosToMap } from '../queries'

describe('queries mappers', () => {
  it('mapProvinciasToMap transforma row DB a Provincia', () => {
    const row = {
      id: 1,
      nombre: 'Santa Cruz',
      slug: 'santa-cruz',
      codigo_indec: '26',
      gobernador_nombre: 'Claudio Vidal',
      partidos: { slug: 'pj', color: '#003087' },
    }
    const result = mapProvinciasToMap(row)
    expect(result.codigoIndec).toBe('26')
    expect(result.partidoColor).toBe('#003087')
    expect(result.gobernadorNombre).toBe('Claudio Vidal')
    expect(result.slug).toBe('santa-cruz')
  })

  it('mapProvinciasToMap maneja partido null', () => {
    const row = {
      id: 2,
      nombre: 'Córdoba',
      slug: 'cordoba',
      codigo_indec: '14',
      gobernador_nombre: null,
      partidos: null,
    }
    const result = mapProvinciasToMap(row)
    expect(result.partidoColor).toBe('#94a3b8')
    expect(result.partidoSlug).toBeNull()
  })

  it('mapMunicipiosToMap transforma row DB a Municipio', () => {
    const row = {
      id: 1,
      nombre: 'Río Gallegos',
      slug: 'rio-gallegos',
      intendente_nombre: 'Pablo Grasso',
      imagen_positiva: 42.5,
      imagen_negativa: 30.1,
      partidos: { slug: 'pj', color: '#003087' },
      provincias: { slug: 'santa-cruz' },
    }
    const result = mapMunicipiosToMap(row)
    expect(result.intendenteNombre).toBe('Pablo Grasso')
    expect(result.imagenPositiva).toBe(42.5)
    expect(result.partidoColor).toBe('#003087')
    expect(result.provinciaSlug).toBe('santa-cruz')
  })

  it('mapMunicipiosToMap maneja partido null', () => {
    const row = {
      id: 2,
      nombre: 'El Calafate',
      slug: 'el-calafate',
      intendente_nombre: null,
      imagen_positiva: null,
      imagen_negativa: null,
      partidos: null,
      provincias: { slug: 'santa-cruz' },
    }
    const result = mapMunicipiosToMap(row)
    expect(result.partidoColor).toBe('#94a3b8')
    expect(result.imagenPositiva).toBeNull()
  })
})
