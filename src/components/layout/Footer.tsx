import Link from 'next/link'

const COLS = [
  {
    titulo: 'Plataforma',
    links: [
      { label: 'Imagen Política',     href: '/imagen' },
      { label: 'Tablero Santa Cruz',  href: '/santa-cruz' },
      { label: 'Mapa Político',       href: '/mapa' },
      { label: 'Monitor de Noticias', href: '/noticias' },
    ],
  },
  {
    titulo: 'Análisis',
    links: [
      { label: 'Encuestas',         href: '/encuestas' },
      { label: 'Comparar',          href: '/comparar' },
      { label: 'Informes PDF',      href: '/informe' },
      { label: 'Clipping IA',       href: '/clipping' },
    ],
  },
  {
    titulo: 'Consultora',
    links: [
      { label: 'Quiénes somos', href: '/nosotros' },
      { label: 'Metodología',   href: '/metodologia' },
      { label: 'Contacto',      href: '/contacto' },
      { label: 'Admin',         href: '/admin' },
    ],
  },
]

export function Footer() {
  return (
    <footer
      className="mt-24"
      style={{
        background: 'var(--cream)',
        borderTop: '1px solid var(--hairline)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* ─── Brand block ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12" style={{ borderBottom: '1px solid var(--hairline)' }}>

          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex flex-col leading-[0.95] mb-6">
              <span
                className="font-bold uppercase"
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '1.45rem',
                  letterSpacing: '0.18em',
                  color: 'var(--ink)',
                }}
              >
                Rumbo
              </span>
              <span
                className="font-semibold uppercase mt-0.5"
                style={{ fontSize: '0.5rem', letterSpacing: '0.4em', color: 'var(--wine)' }}
              >
                Estratégico
              </span>
            </Link>
            <p
              className="max-w-md text-base leading-relaxed"
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontStyle: 'italic',
                color: 'var(--ink-soft)',
              }}
            >
              Consultora de inteligencia política especializada en monitoreo de medios
              y análisis electoral Argentina.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--wine)' }} />
              <span className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--ink-light)' }}>
                 
              </span>
            </div>
          </div>

          {COLS.map(col => (
            <div key={col.titulo} className="lg:col-span-2">
              <h3
                className="font-semibold mb-5 uppercase"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.28em',
                  color: 'var(--wine)',
                }}
              >
                {col.titulo}
              </h3>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--ink-muted)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── Bottom ───────────────────────────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-[10px] tracking-[0.12em]" style={{ color: 'var(--ink-light)' }}>
            © {new Date().getFullYear()} · Rumbo Estratégico · Todos los derechos reservados
          </p>
          <p className="text-[10px] tracking-[0.12em]" style={{ color: 'var(--ink-light)' }}>
            Análisis político independiente · Santa Cruz, Argentina.
          </p>
        </div>
      </div>
    </footer>
  )
}
