'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'

export function GenerarClippingButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  async function generar() {
    setLoading(true)
    setMsg('')
    try {
      const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
      const res = await fetch('/api/generar-clipping', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(`✗ ${data.error ?? 'Error desconocido'}`)
      } else {
        setMsg('✓ Clipping generado')
        router.refresh()
      }
    } catch {
      setMsg('✗ Error de conexión')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={generar}
        disabled={loading}
        className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
        {loading ? 'Generando...' : 'Generar clipping'}
      </button>
      {msg && (
        <p className={`text-xs ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
          {msg}
        </p>
      )}
    </div>
  )
}
