import { createClient } from '@/lib/supabase/server'
import { ProvinciasList } from './ProvinciasList'
import { MunicipiosList } from './MunicipiosList'
import { SelectorProvincia } from './SelectorProvincia'

type SearchParams = Promise<{ provincia?: string }>

export default async function PoliticosPage({ searchParams }: { searchParams: SearchParams }) {
  const { provincia: provinciaQuery } = await searchParams
  const provinciaSlug = provinciaQuery || 'santa-cruz'

  const supabase = await createClient()

  const [
    { data: provincias },
    { data: municipiosRaw },
    { data: partidos },
    { data: provinciaActiva },
  ] = await Promise.all([
    supabase
      .from('provincias')
      .select('id, nombre, slug, gobernador_nombre, partidos(id, nombre, color, slug)')
      .order('nombre'),
    supabase
      .from('municipios')
      .select('id, nombre, slug, tipo, provincia_id, intendente_nombre, imagen_positiva, imagen_negativa, partidos(id, nombre, color, slug), provincias(nombre, slug)')
      .order('nombre'),
    supabase.from('partidos').select('id, nombre, slug, color').order('nombre'),
    supabase.from('provincias').select('id, nombre, slug').eq('slug', provinciaSlug).maybeSingle(),
  ])

  const provinciaNombre = provinciaActiva?.nombre ?? provinciaSlug

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const municipiosProv = ((municipiosRaw ?? []) as any[]).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => m.provincias?.slug === provinciaSlug
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const departamentos = municipiosProv.filter((m: any) => !m.tipo || m.tipo === 'departamento')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ciudades = municipiosProv.filter((m: any) => m.tipo === 'ciudad')

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">Gestión de Políticos del Mapa</h1>
        <p className="text-sm text-gray-500">
          Editá gobernadores e intendentes por provincia. Los datos alimentan el tablero y el mapa.
        </p>
      </div>

      {/* Selector de provincia activa */}
      <SelectorProvincia
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provincias={(provincias ?? []) as any[]}
        provinciaActivaSlug={provinciaSlug}
      />

      {/* Lista de TODAS las provincias (siempre editable — gobernador + partido) */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProvinciasList provincias={(provincias ?? []) as any[]} partidos={partidos ?? []} />

      {/* Municipios SOLO de la provincia activa */}
      {provinciaActiva ? (
        <>
          <MunicipiosList
            titulo={`Departamentos — ${provinciaNombre}`}
            descripcion="Colorea el mapa por partido según el departamento"
            municipios={departamentos}
            partidos={partidos ?? []}
            provinciaId={provinciaActiva.id}
          />

          <MunicipiosList
            titulo={`Localidades de ${provinciaNombre} (${ciudades.length})`}
            descripcion="Ciudades con intendente, partido e imagen. Hacé click en Editar para cargar el intendente actual."
            municipios={ciudades}
            partidos={partidos ?? []}
            destacado
            provinciaId={provinciaActiva.id}
          />
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="text-sm font-bold text-amber-900">Provincia no encontrada: {provinciaSlug}</p>
          <p className="text-xs text-amber-800 mt-1">
            Verificá que la provincia exista en la BD (tabla `provincias`).
          </p>
        </div>
      )}
    </div>
  )
}
