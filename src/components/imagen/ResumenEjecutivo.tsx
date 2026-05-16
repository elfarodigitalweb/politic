import type { Politico, ImagenHistorico, Encuesta } from '@/types/imagen'
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'

interface Props {
  politico: Politico
  imagenActual: ImagenHistorico | null
  historial: ImagenHistorico[]
  ultimaEncuesta: Encuesta | null
}

function nivelImagen(pct: number): { label: string; color: string } {
  if (pct >= 70) return { label: 'Imagen fuerte', color: 'text-green-400' }
  if (pct >= 50) return { label: 'Imagen moderada', color: 'text-yellow-400' }
  if (pct >= 30) return { label: 'Imagen débil', color: 'text-orange-400' }
  return { label: 'Imagen crítica', color: 'text-red-400' }
}

export function ResumenEjecutivo({ imagenActual, historial, ultimaEncuesta }: Props) {
  // Delta vs hace ~7 días
  const hace7dias = historial.find((h) => {
    const diff = (Date.now() - new Date(h.calculadoAt).getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 5 && diff <= 9
  })

  const delta =
    imagenActual && hace7dias
      ? imagenActual.imagenPositiva - hace7dias.imagenPositiva
      : null

  const nivel = imagenActual ? nivelImagen(imagenActual.imagenPositiva) : null

  return (
    <div className="bg-gray-900 text-white rounded-xl p-5 mb-6 print:border print:border-gray-300 print:bg-white print:text-gray-900">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 print:text-gray-500 mb-4">
        Resumen Ejecutivo
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Imagen positiva actual */}
        <div>
          <p className="text-2xl font-black text-white print:text-gray-900">
            {imagenActual ? `${imagenActual.imagenPositiva.toFixed(1)}%` : '—'}
          </p>
          <p className="text-[11px] text-gray-400 print:text-gray-500 mt-0.5">Imagen positiva</p>
          {nivel && (
            <p className={`text-[11px] font-bold mt-1 ${nivel.color} print:text-gray-700`}>
              {nivel.label}
            </p>
          )}
        </div>

        {/* Tendencia 7 días */}
        <div>
          {delta !== null ? (
            <>
              <div className="flex items-center gap-1">
                {delta > 0 ? (
                  <TrendingUp size={16} className="text-green-400" />
                ) : delta < 0 ? (
                  <TrendingDown size={16} className="text-red-400" />
                ) : (
                  <Minus size={16} className="text-gray-400" />
                )}
                <p
                  className={`text-2xl font-black ${
                    delta > 0
                      ? 'text-green-400'
                      : delta < 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                  } print:text-gray-900`}
                >
                  {delta >= 0 ? '+' : ''}
                  {delta.toFixed(1)}pp
                </p>
              </div>
              <p className="text-[11px] text-gray-400 print:text-gray-500 mt-0.5">vs 7 días atrás</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black text-gray-500">—</p>
              <p className="text-[11px] text-gray-400 mt-0.5">vs 7 días atrás</p>
            </>
          )}
        </div>

        {/* Intención de voto (encuesta) */}
        <div>
          <p className="text-2xl font-black text-white print:text-gray-900">
            {ultimaEncuesta?.intencionVoto != null
              ? `${ultimaEncuesta.intencionVoto}%`
              : '—'}
          </p>
          <p className="text-[11px] text-gray-400 print:text-gray-500 mt-0.5">Intención de voto</p>
          {ultimaEncuesta && (
            <p className="text-[11px] text-gray-500 mt-1 truncate">
              {ultimaEncuesta.fuente}
            </p>
          )}
        </div>

        {/* Conocimiento */}
        <div>
          <p className="text-2xl font-black text-white print:text-gray-900">
            {ultimaEncuesta?.conocimiento != null
              ? `${ultimaEncuesta.conocimiento}%`
              : '—'}
          </p>
          <p className="text-[11px] text-gray-400 print:text-gray-500 mt-0.5">Conocimiento</p>
          {ultimaEncuesta?.margenError != null && (
            <p className="text-[11px] text-gray-500 mt-1">±{ultimaEncuesta.margenError}%</p>
          )}
        </div>
      </div>

      {!imagenActual && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
          <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
          <p className="text-xs text-gray-400">
            Sin datos de análisis — ejecutá el análisis desde el panel admin
          </p>
        </div>
      )}

      {ultimaEncuesta && (
        <p className="text-[10px] text-gray-500 mt-4 pt-3 border-t border-gray-800 print:border-gray-200">
          Última encuesta: {ultimaEncuesta.fuente} ·{' '}
          {new Date(ultimaEncuesta.fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
          {ultimaEncuesta.universo && ` · n=${ultimaEncuesta.universo}`}
          {ultimaEncuesta.metodologia && ` · ${ultimaEncuesta.metodologia}`}
        </p>
      )}
    </div>
  )
}
