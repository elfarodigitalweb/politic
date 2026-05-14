'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Partido { id: number; nombre: string; color: string; slug: string }
interface Municipio {
  id: number
  nombre: string
  slug: string
  intendente_nombre: string | null
  imagen_positiva: number | null
  imagen_negativa: number | null
  partidos: Partido | null
}

interface Props {
  municipios: Municipio[]
  partidos: Partido[]
}

export function MunicipiosList({ municipios, partidos }: Props) {
  const [editId, setEditId] = useState<number | null>(null)
  const [intendenteNombre, setIntendenteNombre] = useState('')
  const [partidoId, setPartidoId] = useState('')
  const [imagenPos, setImagenPos] = useState('')
  const [imagenNeg, setImagenNeg] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function startEdit(m: Municipio) {
    setEditId(m.id)
    setIntendenteNombre(m.intendente_nombre ?? '')
    setPartidoId(m.partidos?.id?.toString() ?? '')
    setImagenPos(m.imagen_positiva?.toString() ?? '')
    setImagenNeg(m.imagen_negativa?.toString() ?? '')
  }

  async function save(municipioId: number) {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('municipios')
      .update({
        intendente_nombre: intendenteNombre.trim() || null,
        partido_id: partidoId ? Number(partidoId) : null,
        imagen_positiva: imagenPos ? Number(imagenPos) : null,
        imagen_negativa: imagenNeg ? Number(imagenNeg) : null,
      })
      .eq('id', municipioId)
    setSaving(false)
    setEditId(null)
    router.refresh()
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-800 mb-1">
        Departamentos — Santa Cruz
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        {municipios.length} departamentos cargados
      </p>
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Departamento</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Intendente</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Partido</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Img +</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Img −</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {municipios.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.nombre}</td>

                {editId === m.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={intendenteNombre}
                        onChange={(e) => setIntendenteNombre(e.target.value)}
                        placeholder="Nombre intendente"
                        className="border rounded px-2 py-1 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={partidoId}
                        onChange={(e) => setPartidoId(e.target.value)}
                        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                      >
                        <option value="">Sin partido</option>
                        {partidos.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={imagenPos}
                        onChange={(e) => setImagenPos(e.target.value)}
                        placeholder="0-100"
                        className="border rounded px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={imagenNeg}
                        onChange={(e) => setImagenNeg(e.target.value)}
                        placeholder="0-100"
                        className="border rounded px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-gray-600">
                      {m.intendente_nombre ?? <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {m.partidos ? (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background: m.partidos.color + '25',
                            color: m.partidos.color,
                          }}
                        >
                          {m.partidos.nombre}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">
                      {m.imagen_positiva !== null ? `${m.imagen_positiva}%` : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">
                      {m.imagen_negativa !== null ? `${m.imagen_negativa}%` : <span className="text-gray-400">—</span>}
                    </td>
                  </>
                )}

                <td className="px-4 py-3 text-right">
                  {editId === m.id ? (
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => save(m.id)}
                        disabled={saving}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? '...' : 'OK'}
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
                      onClick={() => startEdit(m)}
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
