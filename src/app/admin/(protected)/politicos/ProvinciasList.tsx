'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Partido { id: number; nombre: string; color: string; slug: string }
interface Provincia {
  id: number
  nombre: string
  slug: string
  gobernador_nombre: string | null
  partidos: Partido | null
}

interface Props {
  provincias: Provincia[]
  partidos: Partido[]
}

export function ProvinciasList({ provincias, partidos }: Props) {
  const [editId, setEditId] = useState<number | null>(null)
  const [govNombre, setGovNombre] = useState('')
  const [govPartidoId, setGovPartidoId] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function startEdit(p: Provincia) {
    setEditId(p.id)
    setGovNombre(p.gobernador_nombre ?? '')
    setGovPartidoId(p.partidos?.id?.toString() ?? '')
  }

  async function save(provinciaId: number) {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('provincias')
      .update({
        gobernador_nombre: govNombre.trim() || null,
        partido_id: govPartidoId ? Number(govPartidoId) : null,
      })
      .eq('id', provinciaId)
    setSaving(false)
    setEditId(null)
    router.refresh()
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        Provincias — Gobernadores
      </h2>
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Provincia</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Gobernador</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Partido</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {provincias.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                <td className="px-4 py-3 text-gray-600">
                  {editId === p.id ? (
                    <input
                      value={govNombre}
                      onChange={(e) => setGovNombre(e.target.value)}
                      placeholder="Nombre gobernador"
                      className="border rounded px-2 py-1 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-red-400"
                    />
                  ) : (
                    p.gobernador_nombre ?? <span className="text-gray-400 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === p.id ? (
                    <select
                      value={govPartidoId}
                      onChange={(e) => setGovPartidoId(e.target.value)}
                      className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                    >
                      <option value="">Sin partido</option>
                      {partidos.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.nombre}
                        </option>
                      ))}
                    </select>
                  ) : p.partidos ? (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        background: p.partidos.color + '25',
                        color: p.partidos.color,
                      }}
                    >
                      {p.partidos.nombre}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editId === p.id ? (
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => save(p.id)}
                        disabled={saving}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? '...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="text-gray-500 px-2 py-1 rounded text-xs hover:text-gray-800"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(p)}
                      className="text-blue-600 text-xs hover:text-blue-800 font-medium"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
