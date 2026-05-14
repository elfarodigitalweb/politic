export interface Partido {
  id: number
  nombre: string
  slug: string
  color: string
  esPersonalizado: boolean
}

export interface Provincia {
  id: number
  nombre: string
  slug: string
  codigoIndec: string
  gobernadorNombre: string | null
  partidoSlug: string | null
  partidoColor: string
}

export interface Municipio {
  id: number
  nombre: string
  slug: string
  provinciaSlug: string
  intendenteNombre: string | null
  partidoSlug: string | null
  partidoColor: string
  imagenPositiva: number | null
  imagenNegativa: number | null
}

export interface GeoJSONFeatureProperties {
  nombre: string
  slug: string
  codigoIndec?: string
}
