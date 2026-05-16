import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, MapPin, BarChart3, Newspaper, Clock, TrendingUp, FileText } from 'lucide-react'
import { timeAgo } from '@/lib/utils/date'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalProvincias },
    { count: totalMunicipios },
    { count: totalPartidos },
    { count: totalPoliticos },
    { count: totalEncuestas },
    { count: totalMenciones },
    { data: ultimaImagen },
    { count: totalMedios },
  ] = await Promise.all([
    supabase.from('provincias').select('*', { count: 'exact', head: true }),
    supabase.from('municipios').select('*', { count: 'exact', head: true }),
    supabase.from('partidos').select('*', { count: 'exact', head: true }),
    supabase.from('politicos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('encuestas').select('*', { count: 'exact', head: true }),
    supabase.from('menciones').select('*', { count: 'exact', head: true }),
    supabase
      .from('imagen_historico')
      .select('calculado_at')
      .order('calculado_at', { ascending: false })
      .limit(1),
    supabase.from('medios_locales').select('*', { count: 'exact', head: true }).eq('activo', true),
  ])

  const ultimaActualizacion = ultimaImagen?.[0]?.calculado_at

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        {ultimaActualizacion && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border">
            <Clock size={12} />
            Último análisis: {timeAgo(ultimaActualizacion)}
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-3xl font-black text-gray-900">{totalPoliticos ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Políticos monitoreados</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-3xl font-black text-gray-900">{totalMenciones ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Total menciones</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-3xl font-black text-gray-900">{totalEncuestas ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Encuestas cargadas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-3xl font-black text-gray-900">{totalMedios ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Medios activos</p>
        </div>
      </div>

      {/* Mapa stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-2xl font-black text-gray-900">{totalProvincias ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Provincias</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-2xl font-black text-gray-900">{totalMunicipios ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Municipios</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-2xl font-black text-gray-900">{totalPartidos ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Partidos</p>
        </div>
      </div>

      {/* Accesos rápidos */}
      <h2 className="text-sm font-black text-gray-500 uppercase tracking-wide mb-3">
        Accesos rápidos
      </h2>
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/admin/imagen"
          className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
        >
          <TrendingUp size={15} />
          Imagen Política
        </Link>
        <Link
          href="/admin/encuestas"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          <BarChart3 size={15} />
          Encuestas
        </Link>
        <Link
          href="/admin/politicos"
          className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold border hover:border-gray-400 transition-colors"
        >
          <Users size={15} />
          Políticos del Mapa
        </Link>
        <Link
          href="/admin/medios"
          className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold border hover:border-gray-400 transition-colors"
        >
          <Newspaper size={15} />
          Medios Locales
        </Link>
        <Link
          href="/informe"
          className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold border hover:border-gray-400 transition-colors"
        >
          <FileText size={15} />
          Informe Ejecutivo
        </Link>
        <Link
          href="/mapa"
          className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold border hover:border-gray-400 transition-colors"
        >
          <MapPin size={15} />
          Ver Mapa
        </Link>
      </div>
    </div>
  )
}
