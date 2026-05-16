import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Clock, FileText } from 'lucide-react'

export const revalidate = 0

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function renderClipping(texto: string) {
  return texto.split('\n').map((linea, i) => {
    if (linea.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-gray-900 mb-1">{linea.slice(2)}</h1>
    if (linea.startsWith('## ')) return <h2 key={i} className="text-base text-gray-500 mb-4 font-normal">{linea.slice(3)}</h2>
    if (linea.startsWith('### ')) return <h3 key={i} className="text-base font-black text-gray-800 mt-6 mb-2">{linea.slice(4)}</h3>
    if (linea.startsWith('---')) return <hr key={i} className="border-gray-200 my-4" />
    if (linea.startsWith('*') && linea.endsWith('*')) return <p key={i} className="text-xs text-gray-400 italic mt-4">{linea.slice(1, -1)}</p>
    if (linea.startsWith('• ') || linea.startsWith('- ')) return <li key={i} className="ml-4 text-sm text-gray-700 leading-relaxed mb-1">{linea.slice(2)}</li>
    if (linea.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">{linea}</p>
  })
}

interface Props { params: Promise<{ id: string }> }

export default async function ClippingDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const service = createServiceClient()
  const { data } = await service.from('clippings').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-1">
        <FileText size={16} className="text-[#E31E24]" />
        <span className="text-xs font-bold text-[#E31E24] uppercase tracking-widest">Clipping histórico</span>
      </div>
      <p className="text-sm text-gray-400 mb-6 flex items-center gap-1">
        <Clock size={12} /> {formatFecha(data.generado_at)}
      </p>
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        {renderClipping(data.contenido)}
      </div>
      <div className="mt-6">
        <Link href="/clipping" className="text-sm text-gray-400 hover:text-gray-700">← Volver al clipping actual</Link>
      </div>
    </div>
  )
}
