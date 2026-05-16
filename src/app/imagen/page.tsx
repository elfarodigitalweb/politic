import type { Metadata } from 'next'
import Link from 'next/link'
import { getPoliticosConImagen } from '@/lib/supabase/politicos-queries'
import { CardPolitico } from '@/components/imagen/CardPolitico'
import { createClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils/date'
import { GitCompare, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Imagen Política — Portal Político',
  description: 'Ranking de imagen positiva y negativa de políticos argentinos en tiempo real.',
}

export const revalidate = 300

export default async function ImagenPage() {
  const supabase = await createClient()
  const [politicos, { data: ultimaImagen }] = await Promise.all([
    getPoliticosConImagen(),
    supabase
      .from('imagen_historico')
      .select('calculado_at')
      .order('calculado_at', { ascending: false })
      .limit(1),
  ])

  const ultimaActualizacion = ultimaImagen?.[0]?.calculado_at

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Imagen Política</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-sm text-gray-500">
              Análisis IA de noticias y redes sociales
            </p>
            {ultimaActualizacion && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} />
                Actualizado {timeAgo(ultimaActualizacion)}
              </span>
            )}
          </div>
        </div>
        <Link
          href="/comparar"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          <GitCompare size={13} />
          Comparar
        </Link>
      </div>
      {politicos.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          <p className="font-semibold">No hay políticos cargados aún</p>
          <p className="text-sm mt-1">Agregá políticos desde el panel admin</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {politicos.map((p, i) => (
            <CardPolitico key={p.id} politico={p} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
