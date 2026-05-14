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
  urlRss: string
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
