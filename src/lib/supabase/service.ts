import { createClient } from '@supabase/supabase-js'

// Cliente con service role key — bypassa RLS completamente
// Usar solo en API routes del servidor, nunca en el cliente
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
