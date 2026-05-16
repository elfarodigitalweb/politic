import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import {
  getPoliticoBySlug,
  getUltimaImagen,
  getHistorialImagen,
  getMencionesByPolitico,
} from '@/lib/supabase/politicos-queries'
import { getAvisosByPolitico, getGastoTotalPolitico } from '@/lib/supabase/avisos-queries'
import { getAllTendencias } from '@/lib/supabase/tendencias-queries'
import { getUltimaEncuesta, getEncuestasByPolitico } from '@/lib/supabase/encuestas-queries'
import { BadgeCargo } from '@/components/imagen/BadgeCargo'
import { GraficoTendencia } from '@/components/imagen/GraficoTendencia'
import { AvisosSection } from '@/components/imagen/AvisosSection'
import { TendenciasSection } from '@/components/imagen/TendenciasSection'
import { ResumenEjecutivo } from '@/components/imagen/ResumenEjecutivo'
import { EncuestasSection } from '@/components/imagen/EncuestasSection'
import { MencionesSection } from '@/components/imagen/MencionesSection'
import { PrintButton } from '@/components/imagen/PrintButton'
import { TrendingUp, TrendingDown, Lock, GitCompare } from 'lucide-react'
import { timeAgo } from '@/lib/utils/date'

export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const politico = await getPoliticoBySlug(slug)
  if (!politico) return { title: 'No encontrado' }
  return {
    title: `${politico.nombre} — Imagen Política`,
    description: `Análisis de imagen de ${politico.nombre}, ${politico.cargo} · Portal Político Argentina`,
  }
}

export default async function PerfilPoliticoPage({ params }: Props) {
  const { slug } = await params
  const [politico, supabase] = await Promise.all([getPoliticoBySlug(slug), createClient()])
  if (!politico) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const [imagenActual, historial, avisos, gastoTotal, tendencias, ultimaEncuesta, encuestas, menciones] =
    await Promise.all([
      getUltimaImagen(politico.id),
      getHistorialImagen(politico.id, 730),
      isLoggedIn ? getAvisosByPolitico(politico.id) : Promise.resolve([]),
      isLoggedIn
        ? getGastoTotalPolitico(politico.id)
        : Promise.resolve({ min: 0, max: 0, totalAvisos: 0 }),
      isLoggedIn ? getAllTendencias(politico.id) : Promise.resolve([]),
      getUltimaEncuesta(politico.id),
      isLoggedIn ? getEncuestasByPolitico(politico.id) : Promise.resolve([]),
      isLoggedIn ? getMencionesByPolitico(politico.id, 20) : Promise.resolve([]),
    ])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 print:py-4 print:max-w-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 print:mb-2">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {politico.fotoUrl ? (
              <Image
                src={politico.fotoUrl}
                alt={politico.nombre}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-xl font-black text-gray-400">{politico.nombre.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{politico.nombre}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <BadgeCargo cargo={politico.cargo} />
              <span className="text-sm text-gray-500 capitalize">
                {politico.provinciaSlug.replace(/-/g, ' ')}
              </span>
              {politico.enTesteo && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  En análisis
                </span>
              )}
            </div>
            {imagenActual && (
              <p className="text-[11px] text-gray-400 mt-1">
                Última actualización: {timeAgo(imagenActual.calculadoAt)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/comparar?a=${politico.slug}`}
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors print:hidden"
          >
            <GitCompare size={13} />
            Comparar
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <ResumenEjecutivo
        politico={politico}
        imagenActual={imagenActual}
        historial={historial}
        ultimaEncuesta={ultimaEncuesta}
      />

      {/* Imagen actual — métricas detalladas */}
      {imagenActual && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
            <TrendingUp size={18} className="text-green-600 mx-auto mb-1" />
            <p className="text-3xl font-black text-green-700">
              {imagenActual.imagenPositiva.toFixed(1)}%
            </p>
            <p className="text-xs text-green-600 font-semibold mt-1">Imagen Positiva</p>
            <p className="text-xs text-gray-400 mt-1">{imagenActual.totalMenciones} menciones</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
            <TrendingDown size={18} className="text-red-500 mx-auto mb-1" />
            <p className="text-3xl font-black text-red-600">
              {imagenActual.imagenNegativa.toFixed(1)}%
            </p>
            <p className="text-xs text-red-500 font-semibold mt-1">Imagen Negativa</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(imagenActual.calculadoAt).toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
      )}

      {/* Sin datos aún */}
      {!imagenActual && (
        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 mb-6 border border-dashed border-gray-200">
          <p className="text-sm">Sin datos aún — el análisis se ejecuta cada 6 horas</p>
        </div>
      )}

      {/* Encuestas — público */}
      {(ultimaEncuesta || encuestas.length > 0) && (
        <EncuestasSection encuestas={isLoggedIn ? encuestas : ultimaEncuesta ? [ultimaEncuesta] : []} />
      )}

      {/* Tendencia histórica — login-gated */}
      {isLoggedIn ? (
        <div className="mt-6">
          <GraficoTendencia historial={historial} />
        </div>
      ) : (
        <div className="mt-6 bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-300">
          <Lock size={18} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-600">Tendencia histórica</p>
          <p className="text-xs text-gray-400 mt-1">
            Iniciá sesión para ver el gráfico de evolución de los últimos 30 días
          </p>
          <Link
            href="/admin/login"
            className="inline-block mt-3 text-xs font-bold text-[#E31E24] hover:underline"
          >
            Iniciar sesión →
          </Link>
        </div>
      )}

      {/* Menciones detalladas — login-gated */}
      {isLoggedIn && <MencionesSection menciones={menciones} />}

      {/* Avisos y tendencias digitales — solo admin */}
      {isLoggedIn && <AvisosSection avisos={avisos} gastoTotal={gastoTotal} />}
      {isLoggedIn && <TendenciasSection tendencias={tendencias} />}

      {/* Print footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400">
        <p>
          Generado por SantaCruzPolítica · {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        <p className="mt-1">Los datos de imagen son estimaciones basadas en análisis de medios y redes sociales.</p>
      </div>
    </div>
  )
}
