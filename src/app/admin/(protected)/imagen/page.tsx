import { createClient } from '@/lib/supabase/server'
import { PoliticosImagenAdmin } from './PoliticosImagenAdmin'

export default async function ImagenAdminPage() {
  const supabase = await createClient()

  const [{ data: politicos }, { data: imagenes }] = await Promise.all([
    supabase.from('politicos').select('*').order('nombre'),
    supabase
      .from('imagen_historico')
      .select('politico_id, imagen_positiva, imagen_negativa, calculado_at')
      .order('calculado_at', { ascending: false }),
  ])

  // Última imagen por político (el primer resultado ya viene ordenado desc)
  const imagenMap = new Map<number, { imagenPositiva: number; imagenNegativa: number; calculadoAt: string }>()
  for (const img of imagenes ?? []) {
    if (!imagenMap.has(img.politico_id)) {
      imagenMap.set(img.politico_id, {
        imagenPositiva: Number(img.imagen_positiva),
        imagenNegativa: Number(img.imagen_negativa),
        calculadoAt: img.calculado_at,
      })
    }
  }

  const politicosConImagen = (politicos ?? []).map(p => ({
    ...p,
    imagenActual: imagenMap.get(p.id) ?? null,
  }))

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">
        Gestión de Imagen Política
      </h1>
      <PoliticosImagenAdmin politicos={politicosConImagen} />
    </div>
  )
}
