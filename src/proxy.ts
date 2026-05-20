import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Rutas que NO requieren login (todo lo demás está protegido).
// La portada `/` es pública para que cualquier visitante vea las 8 tarjetas
// de los módulos; al hacer click en "Explorar" se redirige a /admin/login.
const RUTAS_PUBLICAS = [
  '/',
  '/admin/login',
]

// Rutas técnicas/sistema que siempre pasan (assets, APIs internas, etc.)
function esRutaSistema(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf)$/i.test(pathname)
  )
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Pasar directo si es ruta de sistema o pública
  if (esRutaSistema(pathname)) return NextResponse.next()
  if (RUTAS_PUBLICAS.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.next()
  }

  // Validar sesión Supabase desde cookies
  const res = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Si faltan las env vars, no podemos validar — dejamos pasar para no romper
  // la página con un 500 silencioso (la página luego mostrará su propio error).
  if (!supabaseUrl || !supabaseKey) return res

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Sin sesión → redirigir a login con ?next= para volver tras autenticarse
  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname + req.nextUrl.search)
    return NextResponse.redirect(url)
  }

  return res
}

// Aplicar el middleware a todas las rutas salvo assets estáticos.
// Las exclusiones de rutas públicas/técnicas se hacen dentro del handler.
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots, sitemap
     * - cualquier archivo con extensión
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
}
