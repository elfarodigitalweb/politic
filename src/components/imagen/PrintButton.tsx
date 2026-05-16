'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors print:hidden"
    >
      <Printer size={13} />
      Exportar PDF
    </button>
  )
}
