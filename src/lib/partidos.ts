export const PARTIDOS_PRINCIPALES: Record<string, string> = {
  'pj': '#003087',
  'frente-de-todos': '#003087',
  'union-por-la-patria': '#003087',
  'pro': '#FFD700',
  'juntos-por-el-cambio': '#FFD700',
  'juntos': '#FFD700',
  'ucr': '#DC2626',
  'la-libertad-avanza': '#7C3AED',
  'frente-renovador': '#0EA5E9',
  'otros': '#94a3b8',
}

const COLOR_DEFAULT = '#94a3b8'

export function getColorPartido(slug: string | null | undefined): string {
  if (!slug) return COLOR_DEFAULT
  return PARTIDOS_PRINCIPALES[slug.toLowerCase()] ?? COLOR_DEFAULT
}

export interface PartidoConfig {
  slug: string
  nombre: string
  color: string
}

export const LISTA_PARTIDOS: PartidoConfig[] = [
  { slug: 'pj', nombre: 'PJ / Unión por la Patria', color: '#003087' },
  { slug: 'pro', nombre: 'PRO / Juntos', color: '#FFD700' },
  { slug: 'ucr', nombre: 'UCR', color: '#DC2626' },
  { slug: 'la-libertad-avanza', nombre: 'La Libertad Avanza', color: '#7C3AED' },
  { slug: 'frente-renovador', nombre: 'Frente Renovador', color: '#0EA5E9' },
]
