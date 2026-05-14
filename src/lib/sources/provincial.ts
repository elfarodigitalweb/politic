import { PROVINCIAS_DISPLAY } from '@/types/noticias'

export const PROVINCE_KEYWORDS: Record<string, string[]> = {
  'santa-cruz': ['Santa Cruz', 'Río Gallegos', 'Caleta Olivia', 'El Calafate', 'Puerto Deseado', 'Vidal'],
  'buenos-aires': ['Buenos Aires', 'La Plata', 'Kicillof', 'bonaerense'],
  'ciudad-autonoma': ['CABA', 'Ciudad de Buenos Aires', 'porteño', 'Larreta'],
  'cordoba': ['Córdoba', 'Llaryora', 'cordobés'],
  'santa-fe': ['Santa Fe', 'Rosario', 'Pullaro', 'santafesino'],
  'mendoza': ['Mendoza', 'Cornejo', 'mendocino'],
  'neuquen': ['Neuquén', 'Figueroa', 'neuquino'],
  'rio-negro': ['Río Negro', 'Weretilneck', 'Bariloche', 'Viedma'],
  'chubut': ['Chubut', 'Torres', 'Rawson', 'Comodoro'],
  'tierra-del-fuego': ['Tierra del Fuego', 'Ushuaia', 'Melella'],
  'salta': ['Salta', 'Sáenz', 'salteño'],
  'tucuman': ['Tucumán', 'Jaldo', 'tucumano'],
  'jujuy': ['Jujuy', 'Morales', 'jujeño'],
  'entre-rios': ['Entre Ríos', 'Paraná', 'Frigerio'],
  'corrientes': ['Corrientes', 'Valdés', 'correntino'],
  'misiones': ['Misiones', 'Passalacqua', 'Posadas'],
  'chaco': ['Chaco', 'Ledesma', 'Resistencia'],
  'formosa': ['Formosa', 'Insfrán'],
  'santiago-del-estero': ['Santiago del Estero', 'Zamora'],
  'la-rioja': ['La Rioja', 'Quintela'],
  'catamarca': ['Catamarca', 'Saadi'],
  'san-juan': ['San Juan', 'Orrego'],
  'san-luis': ['San Luis', 'Poggi'],
  'la-pampa': ['La Pampa', 'Ziliotto'],
}

export function detectarProvincias(titulo: string, provinciaFuente: string): string[] {
  const provincias = new Set<string>()
  provincias.add(provinciaFuente)

  for (const [slug, keywords] of Object.entries(PROVINCE_KEYWORDS)) {
    if (keywords.some(kw => titulo.toLowerCase().includes(kw.toLowerCase()))) {
      provincias.add(slug)
    }
  }

  return Array.from(provincias)
}

export function getProvinciaNombre(slug: string): string {
  return PROVINCIAS_DISPLAY[slug] ?? 'Nacional'
}
