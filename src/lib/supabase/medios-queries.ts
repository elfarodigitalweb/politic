import { createClient } from './server'
import type { MedioLocal } from '@/types/noticias'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMedioRow(row: any): MedioLocal {
  return {
    id: row.id,
    nombre: row.nombre,
    urlRss: row.url_rss ?? null,
    dominio: row.dominio ?? null,
    urlScraping: row.url_scraping ?? null,
    provinciaSlug: row.provincia_slug,
    activo: row.activo,
  }
}

export async function getMediosLocales(): Promise<MedioLocal[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('medios_locales')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  return (data ?? []).map(mapMedioRow)
}
