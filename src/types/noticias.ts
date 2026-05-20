export interface NoticiaItem {
  id: string
  titulo: string
  url: string
  fuente: string
  provinciaSlug: string
  provinciaNombre: string
  publicadoAt: string
  politicoSlug?: string
}

export interface MedioLocal {
  id: number
  nombre: string
  // Al menos UNA de las 3 fuentes:
  // 1) urlRss      — feed RSS directo (preferido)
  // 2) dominio     — Google News site:dominio (fallback para medios sin RSS pero bien indexados)
  // 3) urlScraping — scraping HTML directo de la home (último recurso para medios chicos)
  urlRss: string | null
  dominio: string | null
  urlScraping: string | null
  provinciaSlug: string
  activo: boolean
}

export const PROVINCIAS_DISPLAY: Record<string, string> = {
  'nacional': 'Nacional',
  'santa-cruz': 'Santa Cruz',
  'buenos-aires': 'Buenos Aires',
  'ciudad-autonoma': 'CABA',
  'cordoba': 'Córdoba',
  'santa-fe': 'Santa Fe',
  'mendoza': 'Mendoza',
  'neuquen': 'Neuquén',
  'rio-negro': 'Río Negro',
  'chubut': 'Chubut',
  'tierra-del-fuego': 'Tierra del Fuego',
  'salta': 'Salta',
  'tucuman': 'Tucumán',
  'jujuy': 'Jujuy',
  'entre-rios': 'Entre Ríos',
  'corrientes': 'Corrientes',
  'misiones': 'Misiones',
  'chaco': 'Chaco',
  'formosa': 'Formosa',
  'santiago-del-estero': 'Santiago del Estero',
  'la-rioja': 'La Rioja',
  'catamarca': 'Catamarca',
  'san-juan': 'San Juan',
  'san-luis': 'San Luis',
  'la-pampa': 'La Pampa',
}
