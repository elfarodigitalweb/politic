import type { Metadata } from 'next'
import Image from 'next/image'
import { getPoliticosConImagen } from '@/lib/supabase/politicos-queries'
import { getAllUltimasEncuestas } from '@/lib/supabase/encuestas-queries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { BadgeCargo } from '@/components/imagen/BadgeCargo'
import { PrintButton } from '@/components/imagen/PrintButton'

export const metadata: Metadata = {
  title: 'Informe Ejecutivo — Portal Político',
}

export const revalidate = 300

export default async function InformePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [politicos, encuestas] = await Promise.all([
    getPoliticosConImagen(),
    getAllUltimasEncuestas(),
  ])

  const encuestaMap = Object.fromEntries(encuestas.map((e) => [e.politicoSlug, e]))
  const fecha = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 print:py-2 print:px-0 print:max-w-none">
      {/* Header — oculto al imprimir, reemplazado por print-header */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Informe Ejecutivo</h1>
          <p className="text-sm text-gray-500 mt-1">{fecha}</p>
        </div>
        <PrintButton />
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-900">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Santa Cruz<span style={{ color: '#E31E24' }}>Política</span>
            </h1>
            <p className="text-sm text-gray-600 font-semibold mt-0.5">Informe Ejecutivo de Imagen Política</p>
          </div>
          <p className="text-sm text-gray-500 capitalize">{fecha}</p>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 mb-8 print:border-0 print:mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 text-white text-xs print:bg-gray-200 print:text-gray-700">
              <th className="text-left px-4 py-3 font-bold">#</th>
              <th className="text-left px-4 py-3 font-bold">Candidato</th>
              <th className="text-right px-4 py-3 font-bold">Img +</th>
              <th className="text-right px-4 py-3 font-bold">Img −</th>
              <th className="text-right px-4 py-3 font-bold">Tendencia</th>
              <th className="text-right px-4 py-3 font-bold">Int. Voto</th>
              <th className="text-right px-4 py-3 font-bold">Menciones</th>
              <th className="text-right px-4 py-3 font-bold">Fuente encuesta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {politicos.map((p, i) => {
              const enc = encuestaMap[p.slug]
              const delta = p.deltaImagen
              return (
                <tr key={p.id} className="hover:bg-gray-50 print:hover:bg-white">
                  <td className="px-4 py-3 text-gray-400 font-black">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {p.fotoUrl ? (
                          <Image
                            src={p.fotoUrl}
                            alt={p.nombre}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="font-black text-gray-400 text-xs">{p.nombre.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{p.nombre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <BadgeCargo cargo={p.cargo} />
                          <span className="text-[10px] text-gray-400 capitalize">
                            {p.provinciaSlug.replace(/-/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-green-600">
                    {p.imagenActual ? `${p.imagenActual.imagenPositiva.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-red-500">
                    {p.imagenActual ? `${p.imagenActual.imagenNegativa.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {delta !== null ? (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                          delta > 0.4
                            ? 'bg-green-100 text-green-700'
                            : delta < -0.4
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {delta > 0.4 ? (
                          <ArrowUp size={10} />
                        ) : delta < -0.4 ? (
                          <ArrowDown size={10} />
                        ) : (
                          <Minus size={10} />
                        )}
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}pp
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-gray-900">
                    {enc?.intencionVoto != null ? `${enc.intencionVoto}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {p.imagenActual?.totalMenciones ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400">
                    {enc ? (
                      <>
                        {enc.fuente}
                        <br />
                        <span className="text-gray-300">
                          {new Date(enc.fecha).toLocaleDateString('es-AR')}
                        </span>
                      </>
                    ) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cards individuales para detalle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
        {politicos.map((p) => {
          const enc = encuestaMap[p.slug]
          const delta = p.deltaImagen
          const nivel =
            p.imagenActual
              ? p.imagenActual.imagenPositiva >= 70
                ? { label: 'Imagen fuerte', bg: 'bg-green-50', border: 'border-green-200' }
                : p.imagenActual.imagenPositiva >= 50
                  ? { label: 'Imagen moderada', bg: 'bg-yellow-50', border: 'border-yellow-200' }
                  : p.imagenActual.imagenPositiva >= 30
                    ? { label: 'Imagen débil', bg: 'bg-orange-50', border: 'border-orange-200' }
                    : { label: 'Imagen crítica', bg: 'bg-red-50', border: 'border-red-200' }
              : { label: 'Sin datos', bg: 'bg-gray-50', border: 'border-gray-200' }

          return (
            <div
              key={p.id}
              className={`rounded-xl border-2 ${nivel.border} ${nivel.bg} p-4 print:break-inside-avoid`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {p.fotoUrl ? (
                    <Image
                      src={p.fotoUrl}
                      alt={p.nombre}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="font-black text-gray-400">{p.nombre.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">{p.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <BadgeCargo cargo={p.cargo} />
                    <span className="text-[10px] text-gray-500">{nivel.label}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg py-2">
                  <div className="flex items-center justify-center gap-0.5 text-green-600">
                    <TrendingUp size={11} />
                    <span className="font-black text-sm">
                      {p.imagenActual ? `${p.imagenActual.imagenPositiva.toFixed(0)}%` : '—'}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400">img positiva</p>
                </div>
                <div className="bg-white rounded-lg py-2">
                  <div className="flex items-center justify-center gap-0.5 text-red-500">
                    <TrendingDown size={11} />
                    <span className="font-black text-sm">
                      {p.imagenActual ? `${p.imagenActual.imagenNegativa.toFixed(0)}%` : '—'}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400">img negativa</p>
                </div>
                <div className="bg-white rounded-lg py-2">
                  <div className="flex items-center justify-center gap-0.5">
                    {delta !== null && delta > 0.4 ? (
                      <ArrowUp size={11} className="text-green-500" />
                    ) : delta !== null && delta < -0.4 ? (
                      <ArrowDown size={11} className="text-red-500" />
                    ) : (
                      <Minus size={11} className="text-gray-400" />
                    )}
                    <span className={`font-black text-sm ${delta !== null && delta > 0.4 ? 'text-green-600' : delta !== null && delta < -0.4 ? 'text-red-500' : 'text-gray-500'}`}>
                      {delta !== null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : '—'}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400">tendencia</p>
                </div>
              </div>

              {enc && (
                <div className="mt-3 pt-3 border-t border-white/60 text-xs text-gray-600 flex items-center justify-between">
                  <span>
                    Encuesta: <strong>{enc.intencionVoto != null ? `${enc.intencionVoto}% voto` : 'sin int. voto'}</strong>
                  </span>
                  <span className="text-gray-400">{enc.fuente}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Print footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-xs text-gray-400">
        <div className="flex justify-between">
          <p>SantaCruzPolítica · Confidencial</p>
          <p>{fecha}</p>
        </div>
        <p className="mt-1">Análisis basado en fuentes de medios y redes sociales. Los datos de imagen son estimaciones. Las encuestas son cargadas por la consultora.</p>
      </div>

      {/* Botón print (visible, pero funcional) */}
      <div className="mt-8 text-center print:hidden">
        <PrintButton />
        <p className="text-xs text-gray-400 mt-2">
          También podés usar Ctrl+P para guardar como PDF
        </p>
      </div>
    </div>
  )
}
