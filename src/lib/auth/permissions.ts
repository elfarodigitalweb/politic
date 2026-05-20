import type { User } from '@supabase/supabase-js'

export type Rol = 'admin' | 'user'

// Emails siempre-admin definidos en env (ADMIN_EMAILS="a@x.com,b@x.com").
// Resuelve el bootstrap: el primer usuario puede entrar al panel aunque
// nadie le haya asignado rol todavía.
function emailsAdminBootstrap(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? ''
  return raw
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
}

export function getRol(user: User | null | undefined): Rol {
  if (!user) return 'user'
  const email = user.email?.toLowerCase()
  if (email && emailsAdminBootstrap().includes(email)) return 'admin'
  const meta = (user.app_metadata?.role ?? user.user_metadata?.role) as
    | string
    | undefined
  return meta === 'admin' ? 'admin' : 'user'
}

export function esAdmin(user: User | null | undefined): boolean {
  return getRol(user) === 'admin'
}
