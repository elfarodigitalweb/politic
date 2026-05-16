import { createClient } from '@/lib/supabase/server'
import { ProvinciasList } from './ProvinciasList'
import { MunicipiosList } from './MunicipiosList'

export default async function PoliticosPage() {
  const supabase = await createClient()

  const [
    { data: provincias },
    { data: municipiosRaw },
    { data: partidos },
    { data: scProv },
  ] = await Promise.all([
    supabase.from('provincias').select('id, nombre, slug, gobernador_nombre, partidos(id, nombre, color, slug)').order('nombre'),
    supabase.from('municipios').select('id, nombre, slug, tipo, provincia_id, intendente_nombre, imagen_positiva, imagen_negativa, partidos(id, nombre, color, slug), provincias(nombre, slug)').order('nombre'),
    supabase.from('partidos').select('id, nombre, slug, color').order('nombre'),
    supabase.from('provincias').select('id').eq('slug', 'santa-cruz').single(),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const municipiosSC = ((municipiosRaw ?? []) as any[]).filter((m: any) => m.provincias?.slug === 'santa-cruz')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const departamentos = municipiosSC.filter((m: any) => !m.tipo || m.tipo === 'departamento')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ciudades = municipiosSC.filter((m: any) => m.tipo === 'ciudad')

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <h1 className="text-2xl font-black text-gray-900">Gestión de Políticos del Mapa</h1>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProvinciasList provincias={(provincias ?? []) as any[]} partidos={partidos ?? []} />

      <MunicipiosList
        titulo="Departamentos — Santa Cruz"
        descripcion="Colorea el mapa por partido según el departamento"
        municipios={departamentos}
        partidos={partidos ?? []}
        provinciaId={scProv?.id}
      />

      <MunicipiosList
        titulo={`Localidades de Santa Cruz (${ciudades.length})`}
        descripcion="Ciudades con intendente, partido e imagen. Hacé click en Editar para cargar el intendente actual."
        municipios={ciudades}
        partidos={partidos ?? []}
        destacado
        provinciaId={scProv?.id}
      />
    </div>
  )
}
