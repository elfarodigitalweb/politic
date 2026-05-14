import Link from 'next/link'

const SECTIONS = [
  { label: 'Política', href: '/politica' },
  { label: 'Santa Cruz', href: '/santa-cruz' },
  { label: 'Provincias', href: '/provincias' },
  { label: 'Economía', href: '/economia' },
  { label: 'Elecciones', href: '/elecciones' },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="text-xl font-black text-white">
              Santa Cruz<span className="text-[#E31E24]">Política</span>
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Monitoreo político en tiempo real de Santa Cruz y las provincias de Argentina.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Secciones</h3>
            <ul className="space-y-2">
              {SECTIONS.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-sm hover:text-white transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Consultora</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Quiénes somos</Link></li>
              <li><Link href="/metodologia" className="hover:text-white transition-colors">Metodología</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-xs text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} SantaCruzPolítica. Todos los derechos reservados.</p>
          <p>Análisis político independiente</p>
        </div>
      </div>
    </footer>
  )
}
