import type { Politico, Mencion, ImagenHistorico, ImagenActual, PoliticoConImagen } from '../imagen'

describe('imagen types', () => {
  it('Politico tiene campos requeridos', () => {
    const p: Politico = {
      id: 1,
      nombre: 'Claudio Vidal',
      slug: 'claudio-vidal',
      cargo: 'gobernador',
      provinciaSlug: 'santa-cruz',
      palabrasClave: ['Claudio Vidal', 'gobernador Santa Cruz'],
      enTesteo: false,
      activo: true,
      partidoNombre: 'PJ',
      partidoColor: '#003087',
      fotoUrl: null,
      facebookPageId: null,
      instagramUsername: null,
    }
    expect(p.palabrasClave.length).toBeGreaterThan(0)
    expect(p.partidoColor).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('Mencion tiene sentimiento válido', () => {
    const m: Mencion = {
      id: 1,
      politicoId: 1,
      fuente: 'rss',
      titulo: 'Vidal anuncia obras en Santa Cruz',
      sentimiento: 'positivo',
      score: 0.85,
      publicadoAt: new Date().toISOString(),
      url: null,
    }
    expect(['positivo', 'negativo', 'neutral']).toContain(m.sentimiento)
  })

  it('ImagenActual calcula % correctamente', () => {
    const img: ImagenActual = {
      politicoId: 1,
      imagenPositiva: 65.5,
      imagenNegativa: 34.5,
      totalMenciones: 42,
      calculadoAt: new Date().toISOString(),
    }
    expect(img.imagenPositiva + img.imagenNegativa).toBeCloseTo(100, 0)
  })

  it('PoliticoConImagen puede tener imagenActual null', () => {
    const p: PoliticoConImagen = {
      id: 2,
      nombre: 'Pablo Grasso',
      slug: 'pablo-grasso',
      cargo: 'intendente',
      provinciaSlug: 'santa-cruz',
      palabrasClave: ['Pablo Grasso'],
      enTesteo: false,
      activo: true,
      partidoNombre: null,
      partidoColor: '#94a3b8',
      fotoUrl: null,
      facebookPageId: null,
      instagramUsername: null,
      imagenActual: null,
    }
    expect(p.imagenActual).toBeNull()
  })
})
