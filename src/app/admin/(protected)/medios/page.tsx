import { createClient } from '@/lib/supabase/server'
import { MediosAdmin } from './MediosAdmin'

export default async function MediosAdminPage() {
  const supabase = await createClient()
  const { data: medios } = await supabase
    .from('medios_locales')
    .select('*')
    .order('nombre')

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Medios Locales</h1>
      <MediosAdmin medios={medios ?? []} />
    </div>
  )
}
