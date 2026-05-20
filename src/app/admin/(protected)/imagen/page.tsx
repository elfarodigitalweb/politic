import { createServiceClient } from '@/lib/supabase/service'
import { PoliticosImagenAdmin } from './PoliticosImagenAdmin'

export const revalidate = 0

export default async function ImagenAdminPage() {
  // Service client → bypassa RLS, garantiza ver TODOS los datos siempre
  const supabase = createServiceClient()

  const [{ data: politicos }, { data: imagenes }] = await Promise.all([
    supabase.from('politicos').select('*').order('nombre'),
    supabase
      .from('imagen_historico')
      .select('politico_id, imagen_positiva, imagen_negativa, calculado_at')
      .order('calculado_at', { ascending: false }),
  ])

  // Última imagen por político — ignorar valores extremos (≤5 o ≥95)
  // que son basura del analyzer viejo, retroceder a la siguiente
  const imagenMap = new Map<number, { imagenPositiva: number; imagenNegativa: number; calculadoAt: string }>()
  for (const img of imagenes ?? []) {
    if (imagenMap.has(img.politico_id)) continue
    const pos = Number(img.imagen_positiva)
    const neg = Number(img.imagen_negativa)
    // Saltar valores extremos
    if (pos >= 95 || pos <= 5 || neg >= 95 || neg <= 5) continue
    imagenMap.set(img.politico_id, {
      imagenPositiva: pos,
      imagenNegativa: neg,
      calculadoAt: img.calculado_at,
    })
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
