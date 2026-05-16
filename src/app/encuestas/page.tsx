import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllUltimasEncuestas } from '@/lib/supabase/encuestas-queries'
import { BarChart3, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Datos de Encuestas — Portal Político',
  description: 'Intención de voto e imagen de candidatos según las últimas encuestas.',
}

export const revalidate = 300

export default async function EncuestasPage() {
  const encuestas = await getAllUltimasEncuestas()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Datos de Encuestas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Última encuesta disponible por candidato · cargado por la consultora
        </p>
      </div>

      {encuestas.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-10 text-center">
          <BarChart3 size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">Sin datos de encuestas aún</p>
          <p className="text-sm text-gray-400 mt-1">
            Cargá datos desde el{' '}
            <Link href="/admin/encuestas" className="text-[#E31E24] hover:underline">
              panel de administración
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {encuestas.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 flex-shrink-0">
                    {e.politicoNombre.charAt(0)}
                  </div>
                  <div>
                    <Link
                      href={`/imagen/${e.politicoSlug}`}
                      className="font-black text-gray-900 hover:text-[#E31E24] transition-colors flex items-center gap-1"
                    >
                      {e.politicoNombre}
                      <ExternalLink size={11} className="text-gray-400" />
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {e.fuente} ·{' '}
                      {new Date(e.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {e.margenError != null && ` · ±${e.margenError}%`}
                      {e.universo != null && ` · n=${e.universo}`}
                    </p>
                  </div>
                </div>

                {/* Métricas principales */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  {e.intencionVoto != null && (
                    <div className="text-center">
                      <p className="text-lg font-black text-gray-900">{e.intencionVoto}%</p>
                      <p className="text-[10px] text-gray-400">Int. voto</p>
                    </div>
                  )}
                  {e.imagenPositiva != null && (
                    <div className="text-center">
                      <p className="text-lg font-black text-green-600">{e.imagenPositiva}%</p>
                      <p className="text-[10px] text-gray-400">Img +</p>
                    </div>
                  )}
                  {e.imagenNegativa != null && (
                    <div className="text-center">
                      <p className="text-lg font-black text-red-500">{e.imagenNegativa}%</p>
                      <p className="text-[10px] text-gray-400">Img −</p>
                    </div>
                  )}
                  {e.conocimiento != null && (
                    <div className="text-center hidden sm:block">
                      <p className="text-lg font-black text-gray-700">{e.conocimiento}%</p>
                      <p className="text-[10px] text-gray-400">Conoc.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Barra visual de intención de voto */}
              {e.intencionVoto != null && (
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E31E24] rounded-full transition-all"
                      style={{ width: `${Math.min(e.intencionVoto, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {e.notas && (
                <p className="text-xs text-gray-400 mt-2 italic">{e.notas}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-8">
        Datos cargados manualmente por la consultora · Solo se muestra la encuesta más reciente por candidato
      </p>
    </div>
  )
}
