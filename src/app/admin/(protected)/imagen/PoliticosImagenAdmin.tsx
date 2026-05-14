'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, BarChart2 } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PoliticoDB = any

const CARGOS = ['gobernador', 'diputado', 'senador', 'intendente', 'concejal', 'otro']

function toSlug(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

export function PoliticosImagenAdmin({ politicos }: { politicos: PoliticoDB[] }) {
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [cargo, setCargo] = useState('gobernador')
  const [provincia, setProvincia] = useState('santa-cruz')
  const [keywords, setKeywords] = useState('')
  const [partidoNombre, setPartidoNombre] = useState('')
  const [partidoColor, setPartidoColor] = useState('#94a3b8')
  const [enTesteo, setEnTesteo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [triggerLoading, setTriggerLoading] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')
  const router = useRouter()

  async function handleAdd() {
    if (!nombre.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('politicos').insert({
      nombre: nombre.trim(),
      slug: toSlug(nombre),
      cargo,
      provincia_slug: provincia,
      palabras_clave: keywords.split(',').map(k => k.trim()).filter(Boolean),
      partido_nombre: partidoNombre.trim() || null,
      partido_color: partidoColor,
      en_testeo: enTesteo,
    })
    setNombre(''); setKeywords(''); setPartidoNombre('')
    setPartidoColor('#94a3b8'); setShowForm(false); setSaving(false)
    router.refresh()
  }

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}? Se borrarán todas sus menciones.`)) return
    const supabase = createClient()
    await supabase.from('politicos').delete().eq('id', id)
    router.refresh()
  }

  async function handleTriggerAnalisis() {
    setTriggerLoading(true)
    setTriggerMsg('')
    try {
      const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
      const res = await fetch('/api/analizar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
      })
      const data = await res.json()
      setTriggerMsg(res.ok
        ? `✓ Análisis completado: ${data.procesados} políticos procesados`
        : `✗ Error: ${data.error ?? 'desconocido'}`
      )
    } catch {
      setTriggerMsg('✗ Error de conexión')
    }
    setTriggerLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Acciones */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <p className="text-sm text-gray-500">{politicos.length} políticos monitoreados</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleTriggerAnalisis}
            disabled={triggerLoading}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            <BarChart2 size={16} />
            {triggerLoading ? 'Analizando...' : 'Ejecutar análisis ahora'}
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
          >
            <Plus size={16} /> Agregar político
          </button>
        </div>
      </div>

      {triggerMsg && (
        <div className={`text-sm px-4 py-2 rounded-lg ${triggerMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {triggerMsg}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm">Nuevo político a monitorear</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Nombre completo *"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <select value={cargo} onChange={e => setCargo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
              {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={provincia} onChange={e => setProvincia(e.target.value)}
              placeholder="Provincia slug (ej: santa-cruz)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <input value={partidoNombre} onChange={e => setPartidoNombre(e.target.value)}
              placeholder="Partido (ej: PJ, UCR)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <div className="flex gap-2 items-center">
              <input type="color" value={partidoColor} onChange={e => setPartidoColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border" />
              <span className="text-xs text-gray-500">Color del partido</span>
            </div>
            <div className="sm:col-span-2">
              <input value={keywords} onChange={e => setKeywords(e.target.value)}
                placeholder="Palabras clave separadas por comas *"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              <p className="text-xs text-gray-400 mt-1">
                Ej: Claudio Vidal, gobernador Santa Cruz, Vidal SC — máx 3 recomendado
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={enTesteo} onChange={e => setEnTesteo(e.target.checked)} className="rounded" />
            Candidato en testeo (solo visible con login)
          </label>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !nombre.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="text-gray-500 px-4 py-2 text-sm hover:text-gray-800">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Cargo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Partido</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Keywords</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {politicos.map((p: PoliticoDB) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{p.cargo}</td>
                <td className="px-4 py-3">
                  {p.partido_nombre ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.partido_color ?? '#94a3b8' }} />
                      <span className="text-xs">{p.partido_nombre}</span>
                    </span>
                  ) : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">
                  {(p.palabras_clave ?? []).join(', ')}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.en_testeo ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {p.en_testeo ? 'En testeo' : 'Activo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(p.id, p.nombre)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    aria-label={`Eliminar ${p.nombre}`}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
