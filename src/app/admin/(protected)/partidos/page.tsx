import { createClient } from '@/lib/supabase/server'
import { PartidosAdmin } from './PartidosAdmin'

export default async function PartidosPage() {
  const supabase = await createClient()
  const { data: partidos } = await supabase
    .from('partidos')
    .select('id, nombre, slug, color')
    .order('nombre')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Partidos Políticos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administrá los partidos disponibles para asignar a municipios y políticos del mapa
        </p>
      </div>
      <PartidosAdmin partidos={partidos ?? []} />
    </div>
  )
}
