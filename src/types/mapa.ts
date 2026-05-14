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
  /** Siempre tiene valor; usa '#94a3b8' (gris) cuando no hay partido */
  partidoColor: string
}

export interface Municipio {
  id: number
  nombre: string
  slug: string
  provinciaSlug: string
  intendenteNombre: string | null
  partidoSlug: string | null
  /** Siempre tiene valor; usa '#94a3b8' (gris) cuando no hay partido */
  partidoColor: string
  imagenPositiva: number | null
  imagenNegativa: number | null
}

export interface GeoJSONFeatureProperties {
  nombre: string
  slug: string
  codigoIndec?: string
}
