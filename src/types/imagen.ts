export type Cargo = 'gobernador' | 'diputado' | 'senador' | 'intendente' | 'concejal' | 'otro'
export type Sentimiento = 'positivo' | 'negativo' | 'neutral'
export type Fuente = 'rss' | 'google_news' | 'facebook' | 'instagram'

export interface Politico {
  id: number
  nombre: string
  slug: string
  cargo: Cargo | string
  provinciaSlug: string
  palabrasClave: string[]
  enTesteo: boolean
  activo: boolean
  partidoNombre: string | null
  /** Siempre tiene valor; usa '#94a3b8' cuando no hay partido */
  partidoColor: string
  fotoUrl: string | null
  facebookPageId: string | null
  instagramUsername: string | null
}

export interface Mencion {
  id: number
  politicoId: number
  fuente: Fuente | string
  titulo: string
  sentimiento: Sentimiento
  score: number
  publicadoAt: string
  url: string | null
}

export interface ImagenHistorico {
  id: number
  politicoId: number
  imagenPositiva: number
  imagenNegativa: number
  totalMenciones: number
  calculadoAt: string
}

export interface ImagenActual {
  politicoId: number
  imagenPositiva: number
  imagenNegativa: number
  totalMenciones: number
  calculadoAt: string
}

export interface PoliticoConImagen extends Politico {
  imagenActual: ImagenActual | null
}
