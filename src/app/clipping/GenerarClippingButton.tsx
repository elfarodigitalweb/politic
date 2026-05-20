'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'

type Tipo = 'matutino' | 'tarde' | 'nocturno'

const TIPOS: { id: Tipo; label: string; emoji: string }[] = [
  { id: 'matutino', label: 'Matutino', emoji: '☀️' },
  { id: 'tarde',    label: 'Mediodía', emoji: '🌤️' },
  { id: 'nocturno', label: 'Nocturno', emoji: '🌙' },
]

export function GenerarClippingButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [showSql, setShowSql] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  async function generar(tipo?: Tipo) {
    setLoading(true)
    setMsg('')
    setShowSql(false)
    setShowMenu(false)
    try {
      const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
      const url = tipo ? `/api/generar-clipping?tipo=${tipo}` : '/api/generar-clipping'
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(`✗ ${data.error ?? 'Error desconocido'}`)
        if (String(data.error).includes('tabla "clippings" no existe')) setShowSql(true)
      } else {
        setMsg(`✓ ${data.tipo ?? 'Clipping'} generado · ${data.modelo}`)
        router.refresh()
      }
    } catch {
      setMsg('✗ Error de conexión')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-end gap-2 relative">
      <div className="flex gap-2">
        <button
          onClick={() => setShowMenu(v => !v)}
          disabled={loading}
          className="flex items-center gap-2 bg-[#C8102E] text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-85 disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? 'Generando...' : 'Generar clipping'}
        </button>
      </div>

      {showMenu && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-sm shadow-lg z-10 min-w-[160px]">
          {TIPOS.map(t => (
            <button
              key={t.id}
              onClick={() => generar(t.id)}
              className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
            >
              <span>{t.emoji}</span>
              <span className="font-semibold">{t.label}</span>
            </button>
          ))}
          <button
            onClick={() => generar()}
            className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 flex items-center gap-2 border-t border-gray-200"
          >
            <span>✨</span>
            <span className="font-semibold text-[#C8102E]">Auto (según hora)</span>
          </button>
        </div>
      )}

      {msg && (
        <p className={`text-xs max-w-md text-right ${msg.startsWith('✓') ? 'text-green-700' : 'text-red-600'}`}>
          {msg}
        </p>
      )}
      {showSql && (
        <details className="text-xs max-w-2xl">
          <summary className="cursor-pointer font-bold text-red-700">Ver SQL para crear la tabla →</summary>
          <pre className="mt-2 bg-gray-100 p-3 rounded text-[10px] leading-relaxed overflow-auto whitespace-pre-wrap text-left">{`CREATE TABLE IF NOT EXISTS clippings (
  id SERIAL PRIMARY KEY,
  contenido TEXT NOT NULL,
  modelo TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  tokens_usados INTEGER,
  generado_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE clippings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clip_read"  ON clippings FOR SELECT USING (true);
CREATE POLICY "clip_write" ON clippings FOR ALL    USING (true) WITH CHECK (true);`}</pre>
        </details>
      )}
    </div>
  )
}
