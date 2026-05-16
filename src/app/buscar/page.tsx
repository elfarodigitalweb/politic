import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BuscarClient } from './BuscarClient'

export const metadata: Metadata = {
  title: 'Buscar — Portal Político',
  description: 'Buscá políticos argentinos por nombre, cargo o provincia.',
}

export const revalidate = 300

export default async function BuscarPage() {
  const supabase = await createClient()

  const { data: politicos } = await supabase
    .from('politicos')
    .select(`
      id, nombre, slug, cargo, provincia_slug, foto_url,
      imagen_historico(imagen_positiva, imagen_negativa, calculado_at)
    `)
    .eq('activo', true)
    .order('nombre')

  const politicosConImagen = (politicos ?? []).map((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagenes: any[] = Array.isArray(p.imagen_historico) ? p.imagen_historico : []
    const ultima = imagenes.sort(
      (a, b) => new Date(b.calculado_at).getTime() - new Date(a.calculado_at).getTime()
    )[0]
    return {
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      cargo: p.cargo,
      provinciaSlug: p.provincia_slug,
      fotoUrl: p.foto_url ?? null,
      imagenPositiva: ultima ? Number(ultima.imagen_positiva) : null,
      imagenNegativa: ultima ? Number(ultima.imagen_negativa) : null,
    }
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Buscar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Políticos monitoreados en el portal
        </p>
      </div>
      <BuscarClient politicos={politicosConImagen} />
    </div>
  )
}
