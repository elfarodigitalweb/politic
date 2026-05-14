import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Users } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalProvincias },
    { count: totalMunicipios },
    { count: totalPartidos },
  ] = await Promise.all([
    supabase.from('provincias').select('*', { count: 'exact', head: true }),
    supabase.from('municipios').select('*', { count: 'exact', head: true }),
    supabase.from('partidos').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-3xl font-black text-gray-900">{totalProvincias ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Provincias</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-3xl font-black text-gray-900">{totalMunicipios ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Municipios / Departamentos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-3xl font-black text-gray-900">{totalPartidos ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Partidos</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link
          href="/admin/politicos"
          className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
        >
          <Users size={16} />
          Gestionar Políticos
        </Link>
        <Link
          href="/mapa"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          <MapPin size={16} />
          Ver Mapa
        </Link>
      </div>
    </div>
  )
}
