import { createClient } from '@/lib/supabase/server'
import { EncuestasAdmin } from './EncuestasAdmin'

export default async function EncuestasAdminPage() {
  const supabase = await createClient()

  const [{ data: politicos }, { data: encuestas }] = await Promise.all([
    supabase.from('politicos').select('id, nombre, slug').order('nombre'),
    supabase.from('encuestas').select('*').order('fecha', { ascending: false }),
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Gestión de Encuestas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cargá datos de intención de voto, imagen y conocimiento por candidato
        </p>
      </div>
      <EncuestasAdmin politicos={politicos ?? []} encuestas={encuestas ?? []} />
    </div>
  )
}
