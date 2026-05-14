'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Rss } from 'lucide-react'
import { PROVINCIAS_DISPLAY } from '@/types/noticias'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MedioDB = any

export function MediosAdmin({ medios }: { medios: MedioDB[] }) {
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [urlRss, setUrlRss] = useState('')
  const [provincia, setProvincia] = useState('santa-cruz')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleAdd() {
    if (!nombre.trim() || !urlRss.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('medios_locales').insert({
      nombre: nombre.trim(),
      url_rss: urlRss.trim(),
      provincia_slug: provincia,
    })
    setNombre(''); setUrlRss(''); setShowForm(false); setSaving(false)
    router.refresh()
  }

  async function handleDelete(id: number, nombreMedio: string) {
    if (!confirm(`¿Eliminar "${nombreMedio}"?`)) return
    const supabase = createClient()
    await supabase.from('medios_locales').delete().eq('id', id)
    router.refresh()
  }

  const provinciasOptions = Object.entries(PROVINCIAS_DISPLAY).filter(
    ([slug]) => slug !== 'nacional'
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{medios.length} medios configurados</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
        >
          <Plus size={16} /> Agregar medio
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm">Nuevo medio local</h3>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre del medio *"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input
            value={urlRss}
            onChange={e => setUrlRss(e.target.value)}
            placeholder="URL del feed RSS * (ej: https://medio.com/feed/)"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <select
            value={provincia}
            onChange={e => setProvincia(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {provinciasOptions.map(([slug, nombre]) => (
              <option key={slug} value={slug}>{nombre}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !nombre.trim() || !urlRss.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 px-4 py-2 text-sm hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {medios.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No hay medios locales configurados. Agregá el primero.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Medio</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Provincia</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Feed RSS</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {medios.map((m: MedioDB) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Rss size={14} className="text-orange-500 flex-shrink-0" />
                      {m.nombre}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {PROVINCIAS_DISPLAY[m.provincia_slug] ?? m.provincia_slug}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">
                    {m.url_rss}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(m.id, m.nombre)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label={`Eliminar ${m.nombre}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
