import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { esAdmin, type Rol } from '@/lib/auth/permissions'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !esAdmin(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    rol: (u.app_metadata?.role ?? u.user_metadata?.role ?? 'user') as Rol,
    createdAt: u.created_at,
    lastSignIn: u.last_sign_in_at,
    emailConfirmed: !!u.email_confirmed_at,
  }))
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const denied = await assertAdmin()
  if (denied) return denied

  const body = await req.json().catch(() => ({}))
  const { email, password, rol } = body as {
    email?: string
    password?: string
    rol?: Rol
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: rol === 'admin' ? 'admin' : 'user' },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, id: data.user?.id })
}

export async function PATCH(req: NextRequest) {
  const denied = await assertAdmin()
  if (denied) return denied

  const body = await req.json().catch(() => ({}))
  const { userId, rol, password } = body as {
    userId?: string
    rol?: Rol
    password?: string
  }
  if (!userId) {
    return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const updates: { password?: string; app_metadata?: { role: Rol } } = {}
  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: 'Contraseña muy corta (min 6)' }, { status: 400 })
    }
    updates.password = password
  }
  if (rol) {
    updates.app_metadata = { role: rol === 'admin' ? 'admin' : 'user' }
  }

  const { error } = await admin.auth.admin.updateUserById(userId, updates)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const denied = await assertAdmin()
  if (denied) return denied

  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
  }

  // Evitar que el admin se borre a sí mismo
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) {
    return NextResponse.json({ error: 'No podés borrar tu propio usuario' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
