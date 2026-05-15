import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPoliticoBySlug, getUltimaImagen, getHistorialImagen } from '@/lib/supabase/politicos-queries'
import { getAvisosByPolitico, getGastoTotalPolitico } from '@/lib/supabase/avisos-queries'
import { BadgeCargo } from '@/components/imagen/BadgeCargo'
import { GraficoTendencia } from '@/components/imagen/GraficoTendencia'
import { AvisosSection } from '@/components/imagen/AvisosSection'
import { TrendingUp, TrendingDown, Lock } from 'lucide-react'

export const revalidate = 300

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const politico = await getPoliticoBySlug(slug)
  if (!politico) return { title: 'No encontrado' }
  return {
    title: `${politico.nombre} — Imagen Política`,
    description: `Análisis de imagen de ${politico.nombre}, ${politico.cargo}.`,
  }
}

export default async function PerfilPoliticoPage({ params }: Props) {
  const { slug } = await params
  const [politico, supabase] = await Promise.all([
    getPoliticoBySlug(slug),
    createClient(),
  ])
  if (!politico) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const [imagenActual, historial, avisos, gastoTotal] = await Promise.all([
    getUltimaImagen(politico.id),
    isLoggedIn ? getHistorialImagen(politico.id, 30) : Promise.resolve([]),
    isLoggedIn ? getAvisosByPolitico(politico.id) : Promise.resolve([]),
    isLoggedIn ? getGastoTotalPolitico(politico.id) : Promise.resolve({ min: 0, max: 0, totalAvisos: 0 }),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-black text-gray-400 flex-shrink-0">
          {politico.nombre.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{politico.nombre}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <BadgeCargo cargo={politico.cargo} />
            <span className="text-sm text-gray-500">{politico.provinciaSlug.replace(/-/g, ' ')}</span>
            {politico.enTesteo && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">
                En análisis
              </span>
            )}
          </div>
        </div>
      </div>

      {imagenActual ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <TrendingUp size={20} className="text-green-600 mx-auto mb-1" />
            <p className="text-3xl font-black text-green-700">
              {imagenActual.imagenPositiva.toFixed(1)}%
            </p>
            <p className="text-xs text-green-600 font-semibold mt-1">Imagen Positiva</p>
            <p className="text-xs text-gray-400 mt-1">{imagenActual.totalMenciones} menciones</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <TrendingDown size={20} className="text-red-500 mx-auto mb-1" />
            <p className="text-3xl font-black text-red-600">
              {imagenActual.imagenNegativa.toFixed(1)}%
            </p>
            <p className="text-xs text-red-500 font-semibold mt-1">Imagen Negativa</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(imagenActual.calculadoAt).toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 mb-6">
          <p className="text-sm">Sin datos aún — el análisis se ejecuta cada 6 horas</p>
        </div>
      )}

      {isLoggedIn ? (
        <GraficoTendencia historial={historial} />
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-300">
          <Lock size={20} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-600">Tendencia histórica</p>
          <p className="text-xs text-gray-400 mt-1">
            Iniciá sesión para ver el gráfico de evolución
          </p>
        </div>
      )}

      {isLoggedIn && (
        <AvisosSection avisos={avisos} gastoTotal={gastoTotal} />
      )}
    </div>
  )
}
