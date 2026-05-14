import { createClient } from '@/lib/supabase/server'
import { PoliticosImagenAdmin } from './PoliticosImagenAdmin'

export default async function ImagenAdminPage() {
  const supabase = await createClient()
  const { data: politicos } = await supabase
    .from('politicos')
    .select('*')
    .order('nombre')

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">
        Gestión de Imagen Política
      </h1>
      <PoliticosImagenAdmin politicos={politicos ?? []} />
    </div>
  )
}
