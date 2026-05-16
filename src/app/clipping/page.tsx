import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUltimoClipping, getHistorialClippings } from '@/lib/supabase/clippings-queries'
import { GenerarClippingButton } from './GenerarClippingButton'
import { Clock, FileText, Printer, ChevronRight } from 'lucide-react'

export const revalidate = 0

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Renderiza el Markdown del clipping como HTML básico
function renderClipping(texto: string) {
  const lineas = texto.split('\n')
  return lineas.map((linea, i) => {
    if (linea.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-gray-900 mb-1">{linea.slice(2)}</h1>
    if (linea.startsWith('## ')) return <h2 key={i} className="text-base text-gray-500 mb-4 font-normal">{linea.slice(3)}</h2>
    if (linea.startsWith('### ')) return <h3 key={i} className="text-base font-black text-gray-800 mt-6 mb-2 flex items-center gap-2">{linea.slice(4)}</h3>
    if (linea.startsWith('---')) return <hr key={i} className="border-gray-200 my-4" />
    if (linea.startsWith('*') && linea.endsWith('*')) return <p key={i} className="text-xs text-gray-400 italic mt-4">{linea.slice(1, -1)}</p>
    if (linea.startsWith('• ') || linea.startsWith('- ')) return <li key={i} className="ml-4 text-sm text-gray-700 leading-relaxed mb-1">{linea.slice(2)}</li>
    if (linea.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">{linea}</p>
  })
}

export default async function ClippingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [clipping, historial] = await Promise.all([
    getUltimoClipping(),
    getHistorialClippings(7),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 print:py-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 print:mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-[#E31E24]" />
            <span className="text-xs font-bold text-[#E31E24] uppercase tracking-widest">
              Clipping político
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Resumen de noticias</h1>
          {clipping && (
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
              <Clock size={12} />
              Generado: {formatFecha(clipping.generadoAt)}
              {clipping.tokensUsados && (
                <span className="ml-2 text-xs text-gray-300">· {clipping.tokensUsados.toLocaleString()} tokens</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-2 rounded-lg transition-colors"
          >
            <Printer size={14} />
            Imprimir
          </button>
          <GenerarClippingButton />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Clipping principal */}
        <div className="flex-1 min-w-0">
          {clipping ? (
            <div className="bg-white rounded-2xl border shadow-sm p-6 print:shadow-none print:border-0">
              <div className="prose-sm max-w-none">
                {renderClipping(clipping.contenido)}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <FileText size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-600">Sin clipping generado aún</p>
              <p className="text-sm text-gray-400 mt-1">
                Hacé clic en "Generar clipping" para crear el primer resumen.
              </p>
              <div className="mt-4">
                <GenerarClippingButton />
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral: historial */}
        {historial.length > 1 && (
          <div className="w-64 flex-shrink-0 print:hidden">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">
              Historial
            </h3>
            <div className="space-y-2">
              {historial.map((c) => (
                <Link
                  key={c.id}
                  href={`/clipping/${c.id}`}
                  className="block bg-white border rounded-xl p-3 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                >
                  <p className="text-xs font-bold text-gray-700 group-hover:text-indigo-700">
                    {new Date(c.generadoAt).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                    {c.contenido.split('\n').find(l => l.startsWith('###'))?.slice(4) ?? 'Clipping político'}
                  </p>
                  <ChevronRight size={12} className="text-gray-300 group-hover:text-indigo-400 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center gap-3 text-sm print:hidden">
        <Link href="/admin" className="text-gray-400 hover:text-gray-700">← Admin</Link>
        <Link href="/santa-cruz" className="text-gray-400 hover:text-gray-700">Tablero SC</Link>
        <Link href="/imagen" className="text-gray-400 hover:text-gray-700">Imagen política</Link>
      </div>
    </div>
  )
}
