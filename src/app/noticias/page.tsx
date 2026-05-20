import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getMediosLocales } from '@/lib/supabase/medios-queries'
import { fetchTodasLasNoticias } from '@/lib/sources/aggregator'
import { FeedNoticias } from '@/components/noticias/FeedNoticias'

export const metadata: Metadata = {
  title: 'Noticias — Portal Político',
  description: 'Monitor de noticias políticas argentinas en tiempo real, provincia por provincia.',
}

export const revalidate = 3600

export default async function NoticiasPage() {
  const [mediosLocales, supabase] = await Promise.all([
    getMediosLocales(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const noticias = await fetchTodasLasNoticias(
    mediosLocales.map(m => ({
      nombre: m.nombre,
      urlRss: m.urlRss,
      dominio: m.dominio,
      urlScraping: m.urlScraping,
      provinciaSlug: m.provinciaSlug,
    }))
  ).catch((e) => {
    console.error('[NoticiasPage] error en fetchTodasLasNoticias:', e)
    return []
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Monitor de Noticias</h1>
        <p className="text-sm text-gray-500 mt-1">
          {noticias.length} noticias · Actualizado cada hora
          {!isLoggedIn && (
            <>
              {' · '}
              <a href="/admin/login" className="text-[#E31E24] hover:underline">
                Iniciá sesión para ver todo
              </a>
            </>
          )}
        </p>
      </div>
      <FeedNoticias noticias={noticias} isLoggedIn={isLoggedIn} />
    </div>
  )
}
