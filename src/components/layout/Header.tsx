'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'
import { BreakingNewsTicker } from './BreakingNewsTicker'

const NAV_LINKS = [
  { label: 'Imagen',     href: '/imagen' },
  { label: 'Santa Cruz', href: '/santa-cruz' },
  { label: 'Mapa',       href: '/mapa' },
  { label: 'Noticias',   href: '/noticias' },
  { label: 'Encuestas',  href: '/encuestas' },
  { label: 'Comparar',   href: '/comparar' },
  { label: 'Clipping',   href: '/clipping' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header
      className="w-full sticky top-0 z-50"
      style={{
        background: 'rgba(250,250,247,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <BreakingNewsTicker />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* ─── Logo with hairline rule ──────────────────── */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3">
            <div className="flex flex-col leading-[0.95]">
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
                style={{
                  fontSize: '0.5rem',
                  letterSpacing: '0.4em',
                  color: 'var(--wine)',
                  fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                }}
              >
                Estratégico
              </span>
            </div>
            <div
              className="hidden sm:block h-9 w-px"
              style={{ background: 'var(--hairline-2)' }}
            />
            <span
              className="hidden sm:block text-[10px] uppercase tracking-[0.18em] leading-tight max-w-[120px]"
              style={{ color: 'var(--ink-muted)' }}
            >
              Consultora de<br />Inteligencia Política
            </span>
          </Link>

          {/* ─── Nav desktop ──────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-[11px] font-medium tracking-[0.14em] uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ─── Actions ──────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Link
              href="/buscar"
              aria-label="Buscar"
              className="nav-link p-2"
            >
              <Search size={15} />
            </Link>
            <Link
              href="/santa-cruz"
              className="hidden md:inline-flex btn-primary text-[10px] font-semibold uppercase px-4 py-2.5 rounded-none"
            >
              Acceder
            </Link>
            <button
              className="lg:hidden p-2 nav-link"
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile menu ──────────────────────────────────── */}
      {open && (
        <nav
          className="lg:hidden px-6 py-4 flex flex-col gap-1"
          style={{ borderTop: '1px solid var(--hairline)', background: 'var(--paper)' }}
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link text-[11px] font-medium tracking-[0.14em] uppercase py-2.5"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
