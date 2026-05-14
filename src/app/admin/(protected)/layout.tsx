import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-black text-sm">
          Portal Político{' '}
          <span className="text-[#E31E24]">Admin</span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link
            href="/admin/politicos"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Políticos
          </Link>
          <Link
            href="/admin/imagen"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Imagen
          </Link>
          <Link
            href="/admin/medios"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Medios
          </Link>
          <Link
            href="/mapa"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Ver Mapa
          </Link>
          <span className="text-gray-500 text-xs hidden sm:block">
            {user.email}
          </span>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
