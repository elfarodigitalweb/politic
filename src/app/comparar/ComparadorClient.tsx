'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import type { Politico, ImagenHistorico, Encuesta } from '@/types/imagen'
import { BadgeCargo } from '@/components/imagen/BadgeCargo'

interface PoliticoOption {
  id: number
  nombre: string
  slug: string
  cargo: string
  provinciaSlug: string
}

interface Props {
  politicos: PoliticoOption[]
  slugA?: string
  slugB?: string
  politicoA: Politico | null
  politicoB: Politico | null
  imagenA: ImagenHistorico | null
  imagenB: ImagenHistorico | null
  encuestaA: Encuesta | null
  encuestaB: Encuesta | null
}

function TarjetaComparacion({
  politico,
  imagen,
  encuesta,
  color,
}: {
  politico: Politico | null
  imagen: ImagenHistorico | null
  encuesta: Encuesta | null
  color: 'blue' | 'red'
}) {
  const accent = color === 'blue' ? 'border-blue-400' : 'border-[#E31E24]'
  const accentBg = color === 'blue' ? 'bg-blue-50' : 'bg-red-50'

  if (!politico) {
    return (
      <div
        className={`flex-1 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400`}
      >
        <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Seleccioná un candidato</p>
      </div>
    )
  }

  return (
    <div className={`flex-1 border-2 ${accent} rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className={`${accentBg} px-5 py-4 border-b border-gray-100`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-gray-400">
            {politico.nombre.charAt(0)}
          </div>
          <div>
            <Link
              href={`/imagen/${politico.slug}`}
              className="font-black text-gray-900 hover:text-[#E31E24] transition-colors"
            >
              {politico.nombre}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              <BadgeCargo cargo={politico.cargo} />
              <span className="text-xs text-gray-500 capitalize">
                {politico.provinciaSlug.replace(/-/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="p-5 space-y-4">
        {/* Imagen IA */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Imagen (análisis IA)
          </p>
          {imagen ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-green-50 rounded-lg py-3">
                <TrendingUp size={14} className="text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-green-700">
                  {imagen.imagenPositiva.toFixed(0)}%
                </p>
                <p className="text-[10px] text-green-600">positiva</p>
              </div>
              <div className="text-center bg-red-50 rounded-lg py-3">
                <TrendingDown size={14} className="text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-black text-red-600">
                  {imagen.imagenNegativa.toFixed(0)}%
                </p>
                <p className="text-[10px] text-red-500">negativa</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">Sin datos</p>
          )}
          {imagen && (
            <p className="text-[10px] text-gray-400 text-center mt-1">
              {imagen.totalMenciones} menciones ·{' '}
              {new Date(imagen.calculadoAt).toLocaleDateString('es-AR')}
            </p>
          )}
        </div>

        {/* Encuesta */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Última encuesta
          </p>
          {encuesta ? (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              {encuesta.intencionVoto != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Intención de voto</span>
                  <span className="font-black text-gray-900">{encuesta.intencionVoto}%</span>
                </div>
              )}
              {encuesta.imagenPositiva != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Imagen positiva</span>
                  <span className="font-bold text-green-600">{encuesta.imagenPositiva}%</span>
                </div>
              )}
              {encuesta.conocimiento != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Conocimiento</span>
                  <span className="font-bold text-gray-700">{encuesta.conocimiento}%</span>
                </div>
              )}
              <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-200">
                {encuesta.fuente} ·{' '}
                {new Date(encuesta.fecha).toLocaleDateString('es-AR')}
                {encuesta.margenError && ` · ±${encuesta.margenError}%`}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">Sin datos de encuesta</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function ComparadorClient({
  politicos,
  slugA,
  slugB,
  politicoA,
  politicoB,
  imagenA,
  imagenB,
  encuestaA,
  encuestaB,
}: Props) {
  const router = useRouter()

  function handleChange(side: 'a' | 'b', value: string) {
    const params = new URLSearchParams()
    if (side === 'a') {
      if (value) params.set('a', value)
      if (slugB) params.set('b', slugB)
    } else {
      if (slugA) params.set('a', slugA)
      if (value) params.set('b', value)
    }
    router.push(`/comparar?${params.toString()}`)
  }

  return (
    <div>
      {/* Selectores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Candidato A
          </label>
          <select
            value={slugA ?? ''}
            onChange={(e) => handleChange('a', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            {politicos.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Candidato B
          </label>
          <select
            value={slugB ?? ''}
            onChange={(e) => handleChange('b', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            {politicos.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas comparativas */}
      <div className="flex flex-col sm:flex-row gap-4">
        <TarjetaComparacion
          politico={politicoA}
          imagen={imagenA}
          encuesta={encuestaA}
          color="blue"
        />

        <div className="flex items-center justify-center flex-shrink-0 text-gray-300 font-black text-lg">
          VS
        </div>

        <TarjetaComparacion
          politico={politicoB}
          imagen={imagenB}
          encuesta={encuestaB}
          color="red"
        />
      </div>

      {/* Tabla comparativa (si hay datos de ambos) */}
      {politicoA && politicoB && (imagenA || imagenB || encuestaA || encuestaB) && (
        <div className="mt-6 bg-gray-50 rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Tabla comparativa
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-200">
                <th className="text-left pb-2">Métrica</th>
                <th className="text-right pb-2 text-blue-600">{politicoA.nombre.split(' ')[0]}</th>
                <th className="text-right pb-2 text-[#E31E24]">{politicoB.nombre.split(' ')[0]}</th>
                <th className="text-right pb-2">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(imagenA || imagenB) && (
                <>
                  <tr>
                    <td className="py-2 text-gray-600">Imagen positiva (IA)</td>
                    <td className="py-2 text-right font-bold text-blue-600">
                      {imagenA ? `${imagenA.imagenPositiva.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2 text-right font-bold text-[#E31E24]">
                      {imagenB ? `${imagenB.imagenPositiva.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2 text-right text-gray-500 text-xs">
                      {imagenA && imagenB
                        ? (() => {
                            const d = imagenA.imagenPositiva - imagenB.imagenPositiva
                            return (
                              <span className={d > 0 ? 'text-blue-600' : d < 0 ? 'text-red-500' : ''}>
                                {d >= 0 ? '+' : ''}
                                {d.toFixed(1)}pp
                              </span>
                            )
                          })()
                        : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">Total menciones</td>
                    <td className="py-2 text-right font-bold text-blue-600">
                      {imagenA ? imagenA.totalMenciones : '—'}
                    </td>
                    <td className="py-2 text-right font-bold text-[#E31E24]">
                      {imagenB ? imagenB.totalMenciones : '—'}
                    </td>
                    <td className="py-2 text-right text-gray-500 text-xs">
                      {imagenA && imagenB
                        ? `${imagenA.totalMenciones > imagenB.totalMenciones ? '+' : ''}${imagenA.totalMenciones - imagenB.totalMenciones}`
                        : '—'}
                    </td>
                  </tr>
                </>
              )}
              {(encuestaA || encuestaB) && (
                <tr>
                  <td className="py-2 text-gray-600">Intención de voto</td>
                  <td className="py-2 text-right font-bold text-blue-600">
                    {encuestaA?.intencionVoto != null ? `${encuestaA.intencionVoto}%` : '—'}
                  </td>
                  <td className="py-2 text-right font-bold text-[#E31E24]">
                    {encuestaB?.intencionVoto != null ? `${encuestaB.intencionVoto}%` : '—'}
                  </td>
                  <td className="py-2 text-right text-gray-500 text-xs">
                    {encuestaA?.intencionVoto != null && encuestaB?.intencionVoto != null
                      ? (() => {
                          const d = encuestaA.intencionVoto! - encuestaB.intencionVoto!
                          return (
                            <span className={d > 0 ? 'text-blue-600' : d < 0 ? 'text-red-500' : ''}>
                              {d >= 0 ? '+' : ''}
                              {d.toFixed(1)}pp
                            </span>
                          )
                        })()
                      : '—'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
