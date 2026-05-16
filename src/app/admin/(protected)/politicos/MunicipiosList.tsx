'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Edit2, Check, X, MapPin, Plus, Download, Loader2, Trash2 } from 'lucide-react'

interface Partido { id: number; nombre: string; color: string; slug: string }
interface Municipio {
  id: number
  nombre: string
  slug: string
  tipo?: string
  intendente_nombre: string | null
  imagen_positiva: number | null
  imagen_negativa: number | null
  partidos: Partido | null
}

interface Props {
  titulo: string
  descripcion?: string
  municipios: Municipio[]
  partidos: Partido[]
  destacado?: boolean
  provinciaId?: number
}

// 16 localidades predefinidas de Santa Cruz con coordenadas
const CIUDADES_SC = [
  { nombre: 'Río Gallegos',                  slug: 'rio-gallegos',         latitud: -51.6232, longitud: -69.2168 },
  { nombre: 'Caleta Olivia',                 slug: 'caleta-olivia',        latitud: -46.4402, longitud: -67.5273 },
  { nombre: 'El Calafate',                   slug: 'el-calafate',          latitud: -50.3380, longitud: -72.2648 },
  { nombre: 'Puerto Deseado',                slug: 'puerto-deseado',       latitud: -47.7505, longitud: -65.9002 },
  { nombre: 'Las Heras',                     slug: 'las-heras-sc',         latitud: -46.5471, longitud: -68.9613 },
  { nombre: 'Pico Truncado',                 slug: 'pico-truncado',        latitud: -46.7939, longitud: -67.9748 },
  { nombre: 'Puerto San Julián',             slug: 'puerto-san-julian',    latitud: -49.3066, longitud: -67.7181 },
  { nombre: 'Gobernador Gregores',           slug: 'gobernador-gregores',  latitud: -48.7822, longitud: -70.2489 },
  { nombre: 'Perito Moreno',                 slug: 'perito-moreno-sc',     latitud: -46.5544, longitud: -70.9271 },
  { nombre: 'Los Antiguos',                  slug: 'los-antiguos',         latitud: -46.5487, longitud: -71.6278 },
  { nombre: 'El Chaltén',                    slug: 'el-chalten',           latitud: -49.3317, longitud: -72.8856 },
  { nombre: 'Comandante Luis Piedra Buena',  slug: 'piedra-buena',         latitud: -49.9756, longitud: -68.9082 },
  { nombre: 'Puerto Santa Cruz',             slug: 'puerto-santa-cruz',    latitud: -50.0135, longitud: -68.5195 },
  { nombre: '28 de Noviembre',               slug: '28-de-noviembre',      latitud: -51.5951, longitud: -72.2085 },
  { nombre: 'Tres Lagos',                    slug: 'tres-lagos',           latitud: -49.6019, longitud: -71.4811 },
  { nombre: 'Río Turbio',                    slug: 'rio-turbio',           latitud: -51.5396, longitud: -72.3133 },
]

function toSlug(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

export function MunicipiosList({ titulo, descripcion, municipios, partidos, destacado, provinciaId }: Props) {
  const [editId, setEditId] = useState<number | null>(null)
  const [intendenteNombre, setIntendenteNombre] = useState('')
  const [partidoId, setPartidoId] = useState('')
  const [imagenPos, setImagenPos] = useState('')
  const [imagenNeg, setImagenNeg] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addNombre, setAddNombre] = useState('')
  const [addIntendente, setAddIntendente] = useState('')
  const [addPartidoId, setAddPartidoId] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  const [cargandoPredefinidas, setCargandoPredefinidas] = useState(false)
  const [cargaMsg, setCargaMsg] = useState('')

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
    await supabase.from('municipios').update({
      intendente_nombre: intendenteNombre.trim() || null,
      partido_id: partidoId ? Number(partidoId) : null,
      imagen_positiva: imagenPos ? Number(imagenPos) : null,
      imagen_negativa: imagenNeg ? Number(imagenNeg) : null,
    }).eq('id', municipioId)
    setSaving(false)
    setEditId(null)
    router.refresh()
  }

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('municipios').delete().eq('id', id)
    setDeletingId(null)
    router.refresh()
  }

  async function agregarLocalidad() {
    if (!addNombre.trim() || !provinciaId) return
    setAddLoading(true)
    const supabase = createClient()
    await supabase.from('municipios').insert({
      nombre: addNombre.trim(),
      slug: toSlug(addNombre),
      provincia_id: provinciaId,
      tipo: 'ciudad',
      intendente_nombre: addIntendente.trim() || null,
      partido_id: addPartidoId ? Number(addPartidoId) : null,
    })
    setAddNombre(''); setAddIntendente(''); setAddPartidoId('')
    setShowAddForm(false)
    setAddLoading(false)
    router.refresh()
  }

  async function cargarPredefinidas() {
    if (!provinciaId) {
      setCargaMsg('Error: no se encontró la provincia Santa Cruz en la DB')
      return
    }
    setCargandoPredefinidas(true)
    setCargaMsg('')
    const supabase = createClient()

    let ok = 0, error = 0
    for (const ciudad of CIUDADES_SC) {
      const { error: err } = await supabase.from('municipios').upsert({
        nombre: ciudad.nombre,
        slug: ciudad.slug,
        provincia_id: provinciaId,
        tipo: 'ciudad',
        latitud: ciudad.latitud,
        longitud: ciudad.longitud,
      }, { onConflict: 'slug', ignoreDuplicates: false })
      if (err) error++
      else ok++
    }

    setCargaMsg(
      error === 0
        ? `✓ ${ok} localidades cargadas. Ahora editá los intendentes en la tabla.`
        : `✓ ${ok} cargadas, ${error} errores. Verificá que las columnas latitud/longitud existan (migration 007).`
    )
    setCargandoPredefinidas(false)
    router.refresh()
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className={`text-lg font-bold text-gray-800 ${destacado ? 'text-[#E31E24]' : ''}`}>
            {titulo}
          </h2>
          {descripcion && <p className="text-xs text-gray-500 mt-0.5">{descripcion}</p>}
        </div>

        {/* Botones solo para la sección de ciudades */}
        {destacado && (
          <div className="flex gap-2 flex-wrap">
            {municipios.length === 0 && (
              <button
                onClick={cargarPredefinidas}
                disabled={cargandoPredefinidas || !provinciaId}
                className="flex items-center gap-2 bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {cargandoPredefinidas ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {cargandoPredefinidas ? 'Cargando...' : 'Cargar 16 localidades SC'}
              </button>
            )}
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              <Plus size={14} />
              Agregar localidad
            </button>
          </div>
        )}
      </div>

      {/* Mensaje de carga predefinida */}
      {cargaMsg && (
        <div className={`text-sm px-4 py-2 rounded-lg mb-3 ${cargaMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {cargaMsg}
        </div>
      )}

      {/* Formulario para agregar localidad */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Nueva localidad</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={addNombre}
              onChange={(e) => setAddNombre(e.target.value)}
              placeholder="Nombre de la localidad *"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <input
              value={addIntendente}
              onChange={(e) => setAddIntendente(e.target.value)}
              placeholder="Nombre del intendente"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <select
              value={addPartidoId}
              onChange={(e) => setAddPartidoId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">Sin partido</option>
              {partidos.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={agregarLocalidad}
              disabled={addLoading || !addNombre.trim()}
              className="bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Check size={13} />
              {addLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 px-4 py-2 text-sm hover:text-gray-800 border rounded-lg hover:border-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {municipios.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <MapPin size={28} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600">Sin localidades cargadas</p>
          {destacado && (
            <p className="text-sm text-gray-400 mt-1">
              Hacé click en <strong>"Cargar 16 localidades SC"</strong> para agregar todas las ciudades de Santa Cruz automáticamente.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Localidad</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Intendente</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Partido</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Img +</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Img −</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {municipios.map((m) => (
                <tr key={m.id} className={`hover:bg-gray-50 ${!m.intendente_nombre && destacado ? 'bg-amber-50/40' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {m.nombre}
                    {!m.intendente_nombre && destacado && (
                      <span className="ml-2 text-[10px] text-amber-600 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                        falta intendente
                      </span>
                    )}
                  </td>

                  {editId === m.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={intendenteNombre}
                          onChange={(e) => setIntendenteNombre(e.target.value)}
                          placeholder="Nombre completo"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && save(m.id)}
                          className="border rounded-lg px-2 py-1.5 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={partidoId}
                          onChange={(e) => setPartidoId(e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          <option value="">Sin partido</option>
                          {partidos.map((pt) => (
                            <option key={pt.id} value={pt.id}>{pt.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" min="0" max="100" step="0.1"
                          value={imagenPos} onChange={(e) => setImagenPos(e.target.value)}
                          placeholder="0-100"
                          className="border rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" min="0" max="100" step="0.1"
                          value={imagenNeg} onChange={(e) => setImagenNeg(e.target.value)}
                          placeholder="0-100"
                          className="border rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-gray-700">
                        {m.intendente_nombre ?? <span className="text-gray-400 italic text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {m.partidos ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: m.partidos.color + '25', color: m.partidos.color }}>
                            {m.partidos.nombre}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-green-600 tabular-nums font-bold text-xs">
                        {m.imagen_positiva !== null ? `${m.imagen_positiva}%` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-red-500 tabular-nums font-bold text-xs">
                        {m.imagen_negativa !== null ? `${m.imagen_negativa}%` : <span className="text-gray-300">—</span>}
                      </td>
                    </>
                  )}

                  <td className="px-4 py-3 text-right">
                    {editId === m.id ? (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => save(m.id)} disabled={saving}
                          className="bg-green-600 text-white px-2.5 py-1.5 rounded-lg text-xs hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
                          <Check size={11} />
                          {saving ? '...' : 'OK'}
                        </button>
                        <button onClick={() => setEditId(null)}
                          className="text-gray-500 px-2 py-1.5 rounded-lg text-xs hover:text-gray-800 border hover:border-gray-400">
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => startEdit(m)}
                          className="text-blue-600 text-xs hover:text-blue-800 font-medium flex items-center gap-1">
                          <Edit2 size={11} />
                          Editar
                        </button>
                        <button
                          onClick={() => eliminar(m.id, m.nombre)}
                          disabled={deletingId === m.id}
                          className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId === m.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
