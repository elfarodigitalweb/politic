'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'
import { BreakingNewsTicker } from './BreakingNewsTicker'

const NAV_LINKS = [
  { label: 'Mapa', href: '/mapa' },
  { label: 'Política', href: '/politica' },
  { label: 'Santa Cruz', href: '/santa-cruz' },
  { label: 'Provincias', href: '/provincias' },
  { label: 'Economía', href: '/economia' },
  { label: 'Elecciones', href: '/elecciones' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <BreakingNewsTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Santa Cruz<span className="text-[#E31E24]">Política</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-gray-700 hover:text-[#E31E24] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/buscar"
              aria-label="Buscar"
              className="p-2 text-gray-600 hover:text-[#E31E24] transition-colors"
            >
              <Search size={20} />
            </Link>
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-700 hover:text-[#E31E24]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
