'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'

type Resultado = {
  detectados: number
  guardados: number
  errorEscaneo?: string
}

export default function RefreshTableroButton({ provinciaSlug }: { provinciaSlug: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refrescar = async () => {
    setResultado(null)
    setError(null)
    setLoading(true)
    try {
      const r = await fetch(`/api/refresh-tablero/${provinciaSlug}`, {
        method: 'POST',
        cache: 'no-store',
      })
      const data = (await r.json()) as Resultado
      setResultado(data)
      if (data.errorEscaneo) setError(data.errorEscaneo)
    } catch (e) {
      setError(String(e))
    }
    startTransition(() => {
      router.refresh()
      setLoading(false)
      setTimeout(() => {
        setResultado(null)
        setError(null)
      }, 6000)
    })
  }

  const busy = loading || isPending

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={refrescar}
        disabled={busy}
        className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#E31E24] hover:bg-[#c41a1f] disabled:opacity-60 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-colors"
        title="Escanear medios y refrescar alertas"
      >
        <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
        {busy ? 'Escaneando medios...' : 'Refrescar alertas'}
      </button>

      {!busy && resultado && !error && (
        <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-md">
          <Check size={12} />
          {resultado.guardados > 0
            ? `+${resultado.guardados} alertas nuevas`
            : resultado.detectados > 0
              ? `Sin novedades (${resultado.detectados} ya estaban)`
              : 'Los RSS no traen alertas nuevas'}
        </span>
      )}

      {!busy && error && (
        <span
          className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md"
          title={error}
        >
          <AlertCircle size={12} /> Error en el escaneo
        </span>
      )}
    </div>
  )
}
