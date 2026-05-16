'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check, X, Loader2 } from 'lucide-react'

interface Partido {
  id: number
  nombre: string
  slug: string
  color: string
}

interface Props {
  partidos: Partido[]
}

function toSlug(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

export function PartidosAdmin({ partidos: initial }: Props) {
  const [partidos, setPartidos] = useState<Partido[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState('#94a3b8')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editColor, setEditColor] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function guardar() {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('partidos')
      .insert({ nombre: nombre.trim(), slug: toSlug(nombre), color, es_personalizado: false })
      .select().single()
    if (err) { setError(err.message); setSaving(false); return }
    setPartidos(p => [...p, data])
    setNombre(''); setColor('#94a3b8'); setShowForm(false); setSaving(false)
  }

  async function guardarEdicion(id: number) {
    if (!editNombre.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('partidos').update({ nombre: editNombre.trim(), color: editColor }).eq('id', id)
    setPartidos(p => p.map(pt => pt.id === id ? { ...pt, nombre: editNombre.trim(), color: editColor } : pt))
    setEditId(null); setSaving(false)
    router.refresh()
  }

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar el partido "${nombre}"? Los municipios y políticos que lo usan quedarán sin partido.`)) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('partidos').delete().eq('id', id)
    setPartidos(p => p.filter(pt => pt.id !== id))
    setDeletingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{partidos.length} partidos cargados</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
        >
          <Plus size={15} />
          Nuevo partido
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5">
          <h3 className="font-black text-gray-900 mb-4">Agregar partido político</h3>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && guardar()}
              placeholder="Nombre del partido (ej: SER, PJ, UCR)"
              autoFocus
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                title="Color del partido"
              />
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{ backgroundColor: color + '25', color, borderColor: color + '60' }}
              >
                {nombre || 'Vista previa'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={guardar}
                disabled={saving || !nombre.trim()}
                className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50"
              >
                <Check size={14} />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => { setShowForm(false); setError('') }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border rounded-lg hover:border-gray-400"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Partido</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Color</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Slug</th>
              <th className="px-4 py-3 w-32" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {partidos.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editId === p.id ? (
                    <input
                      value={editNombre}
                      onChange={e => setEditNombre(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && guardarEdicion(p.id)}
                      autoFocus
                      className="border rounded-lg px-2 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
                    />
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: p.color + '20', color: p.color }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.nombre}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === p.id ? (
                    <input
                      type="color"
                      value={editColor}
                      onChange={e => setEditColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: p.color }} />
                      <code className="text-xs text-gray-500">{p.color}</code>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {editId === p.id ? (
                      <>
                        <button
                          onClick={() => guardarEdicion(p.id)}
                          disabled={saving}
                          className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check size={11} /> OK
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-gray-400 hover:text-gray-700 border px-2 py-1.5 rounded-lg text-xs hover:border-gray-400"
                        >
                          <X size={11} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditId(p.id); setEditNombre(p.nombre); setEditColor(p.color) }}
                          className="text-blue-600 text-xs hover:text-blue-800 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminar(p.id, p.nombre)}
                          disabled={deletingId === p.id}
                          className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId === p.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
