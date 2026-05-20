import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { esAdmin, type Rol } from '@/lib/auth/permissions'
import UsuariosAdmin, { type UsuarioRow } from './UsuariosAdmin'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login?next=/admin/usuarios')
  if (!esAdmin(user)) {
    return (
      <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h1 className="text-lg font-black text-amber-900 mb-2">Sin permisos</h1>
        <p className="text-sm text-amber-800">
          Solo los usuarios con rol <span className="font-bold">admin</span> pueden gestionar usuarios.
          Pedile a alguien con permisos que te asigne el rol, o configurá tu email en{' '}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">ADMIN_EMAILS</code> en Vercel.
        </p>
      </div>
    )
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 })

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6">
        <h1 className="text-lg font-black text-red-900 mb-2">Error</h1>
        <p className="text-sm text-red-800">No se pudieron cargar los usuarios: {error.message}</p>
      </div>
    )
  }

  const usuarios: UsuarioRow[] = data.users.map(u => ({
    id: u.id,
    email: u.email ?? '(sin email)',
    rol: ((u.app_metadata?.role ?? u.user_metadata?.role ?? 'user') as Rol),
    createdAt: u.created_at,
    lastSignIn: u.last_sign_in_at ?? null,
    emailConfirmed: !!u.email_confirmed_at,
  }))

  return <UsuariosAdmin usuariosIniciales={usuarios} miUserId={user.id} />
}
