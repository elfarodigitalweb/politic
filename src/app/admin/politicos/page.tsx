import { createClient } from '@/lib/supabase/server'
import { ProvinciasList } from './ProvinciasList'
import { MunicipiosList } from './MunicipiosList'

export default async function PoliticosPage() {
  const supabase = await createClient()

  const [
    { data: provincias },
    { data: municipios },
    { data: partidos },
  ] = await Promise.all([
    supabase
      .from('provincias')
      .select('id, nombre, slug, gobernador_nombre, partidos(id, nombre, color, slug)')
      .order('nombre'),
    supabase
      .from('municipios')
      .select('id, nombre, slug, provincia_id, intendente_nombre, imagen_positiva, imagen_negativa, partidos(id, nombre, color, slug), provincias(nombre, slug)')
      .order('nombre'),
    supabase
      .from('partidos')
      .select('id, nombre, slug, color')
      .order('nombre'),
  ])

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <h1 className="text-2xl font-black text-gray-900">Gestión de Políticos</h1>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProvinciasList
        provincias={(provincias ?? []) as any[]}
        partidos={partidos ?? []}
      />

      <MunicipiosList
        municipios={
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((municipios ?? []) as any[]).filter(
            (m: any) => m.provincias?.slug === 'santa-cruz'
          )
        }
        partidos={partidos ?? []}
      />
    </div>
  )
}
