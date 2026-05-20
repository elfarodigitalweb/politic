'use client'

import { useState, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, BarChart2, TrendingUp, TrendingDown, Edit2, Check, X, FileText, ExternalLink, Sparkles, Wand2 } from 'lucide-react'

interface ImagenActual {
  imagenPositiva: number
  imagenNegativa: number
  calculadoAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PoliticoDB = any & { imagenActual: ImagenActual | null }

const CARGOS = ['presidente', 'vicepresidente', 'gobernador', 'vicegobernador', 'senador', 'diputado', 'intendente', 'concejal', 'otro']

function toSlug(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

function NivelBadge({ pct }: { pct: number }) {
  if (pct >= 60) return <span className="text-[10px] font-bold text-green-600">● Fuerte</span>
  if (pct >= 50) return <span className="text-[10px] font-bold text-yellow-600">● Moderada</span>
  if (pct >= 35) return <span className="text-[10px] font-bold text-orange-500">● Débil</span>
  return <span className="text-[10px] font-bold text-red-600">● Crítica</span>
}

export function PoliticosImagenAdmin({ politicos }: { politicos: PoliticoDB[] }) {
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [cargo, setCargo] = useState('intendente')
  const [provincia, setProvincia] = useState('santa-cruz')
  const [keywords, setKeywords] = useState('')
  const [partidoNombre, setPartidoNombre] = useState('')
  const [partidoColor, setPartidoColor] = useState('#94a3b8')
  const [facebookPageId, setFacebookPageId] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [enTesteo, setEnTesteo] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editImgId, setEditImgId] = useState<number | null>(null)
  const [imgPos, setImgPos] = useState('')
  const [imgNeg, setImgNeg] = useState('')
  const [savingImg, setSavingImg] = useState(false)

  const [triggerLoading, setTriggerLoading] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  const [iaLoadingId, setIaLoadingId] = useState<number | null>(null)
  const [iaMsg, setIaMsg] = useState('')
  const router = useRouter()

  async function analizarConIA(politicoId: number, nombre: string) {
    setIaLoadingId(politicoId)
    setIaMsg('')
    try {
      const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
      const res = await fetch('/api/analizar-politico-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ politicoId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setIaMsg(`✗ ${nombre}: ${data.error ?? 'Error desconocido'}`)
      } else {
        setIaMsg(`✓ ${nombre}: ${data.imagen_positiva.toFixed(1)}% pos / ${data.imagen_negativa.toFixed(1)}% neg · tendencia ${data.tendencia}`)
        router.refresh()
      }
    } catch {
      setIaMsg(`✗ ${nombre}: error de conexión`)
    }
    setIaLoadingId(null)
  }

  async function handleAdd() {
    if (!nombre.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: insertado } = await supabase.from('politicos').insert({
      nombre: nombre.trim(),
      slug: toSlug(nombre),
      cargo,
      provincia_slug: provincia,
      palabras_clave: keywords.split(',').map(k => k.trim()).filter(Boolean),
      partido_nombre: partidoNombre.trim() || null,
      partido_color: partidoColor,
      facebook_page_id: facebookPageId.trim() || null,
      foto_url: fotoUrl.trim() || null,
      en_testeo: enTesteo,
    }).select('id, nombre').single()

    // Disparar análisis IA automáticamente para el nuevo político
    if (insertado?.id) {
      setIaMsg(`⏳ Analizando ${insertado.nombre} con IA...`)
      try {
        const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
        const res = await fetch('/api/analizar-politico-ia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
          body: JSON.stringify({ politicoId: insertado.id }),
        })
        const data = await res.json()
        if (res.ok) {
          setIaMsg(`✓ ${insertado.nombre}: ${data.imagen_positiva.toFixed(1)}% pos / ${data.imagen_negativa.toFixed(1)}% neg`)
        } else {
          setIaMsg(`⚠ Político creado pero IA falló: ${data.error ?? 'desconocido'}`)
        }
      } catch {
        setIaMsg('⚠ Político creado pero IA falló por conexión')
      }
    }

    setNombre(''); setKeywords(''); setPartidoNombre('')
    setPartidoColor('#94a3b8'); setFacebookPageId(''); setFotoUrl(''); setShowForm(false); setSaving(false)
    router.refresh()
  }

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}? Se borrarán todas sus menciones.`)) return
    const supabase = createClient()
    await supabase.from('politicos').delete().eq('id', id)
    router.refresh()
  }

  async function guardarImagenManual(politicoId: number) {
    const pos = parseFloat(imgPos)
    const neg = parseFloat(imgNeg)
    if (isNaN(pos) || isNaN(neg) || pos < 0 || pos > 100 || neg < 0 || neg > 100) return
    setSavingImg(true)
    const supabase = createClient()
    await supabase.from('imagen_historico').insert({
      politico_id: politicoId,
      imagen_positiva: pos,
      imagen_negativa: neg,
      total_menciones: 0,
    })
    setSavingImg(false)
    setEditImgId(null)
    setImgPos(''); setImgNeg('')
    router.refresh()
  }

  async function handleSeedSC() {
    setSeedLoading(true); setSeedMsg('')
    try {
      const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
      const res = await fetch('/api/seed-sc', { method: 'POST', headers: { Authorization: `Bearer ${secret}` } })
      const data = await res.json()
      if (!res.ok) {
        setSeedMsg(`✗ ${data.error ?? 'Error desconocido'}`)
      } else {
        setSeedMsg(`✓ ${data.alertasInsertadas ?? 0} alertas cargadas · ${data.municipiosActualizados ?? 0} municipios corregidos`)
        router.refresh()
      }
    } catch { setSeedMsg('✗ Error de conexión') }
    setSeedLoading(false)
  }

  async function handleScanSC() {
    setScanLoading(true); setScanMsg('')
    try {
      const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
      const res = await fetch('/api/escanear-sc', { method: 'POST', headers: { Authorization: `Bearer ${secret}` } })
      const data = await res.json()
      if (!res.ok) {
        setScanMsg(`✗ Error: ${data.error ?? 'desconocido'}`)
      } else if (data.errorGuardado) {
        setScanMsg(`⚠ ${data.detectados} detectadas pero no se guardaron: ${data.nota ?? data.errorGuardado}`)
      } else {
        const detalle = Object.entries(data.porLocalidad ?? {})
          .map(([loc, n]) => `${loc}: ${n}`).join(' · ')
        setScanMsg(`✓ ${data.detectados} alertas · ${data.guardados} nuevas guardadas${detalle ? ` · ${detalle}` : ''}`)
      }
    } catch { setScanMsg('✗ Error de conexión') }
    setScanLoading(false)
  }

  async function handleTriggerAnalisis() {
    setTriggerLoading(true); setTriggerMsg('')
    try {
      const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
      const res = await fetch('/api/analizar', { method: 'POST', headers: { Authorization: `Bearer ${secret}` } })
      const data = await res.json()
      if (!res.ok) {
        setTriggerMsg(`✗ Error: ${data.error ?? 'desconocido'}`)
      } else if (data.error) {
        setTriggerMsg(`⚠ ${data.error}`)
      } else {
        const fuentesStr = Object.entries(data.fuentes ?? {})
          .filter(([, n]) => (n as number) > 0)
          .map(([f, n]) => `${f}: ${n}`).join(' | ')
        const conMenciones = (data.detalle ?? []).filter((d: { menciones: number }) => d.menciones > 0).length
        setTriggerMsg(`✓ ${data.procesados} políticos · ${conMenciones} con menciones · ${fuentesStr || 'sin noticias encontradas'}`)
      }
    } catch { setTriggerMsg('✗ Error de conexión') }
    setTriggerLoading(false)
  }

  const conDatos = politicos.filter(p => p.imagenActual !== null).length
  const sinDatos = politicos.length - conDatos

  return (
    <div className="space-y-5">
      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border px-4 py-3 text-center">
          <p className="text-2xl font-black text-gray-900">{politicos.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Monitoreados</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 px-4 py-3 text-center">
          <p className="text-2xl font-black text-green-700">{conDatos}</p>
          <p className="text-xs text-green-600 mt-0.5">Con datos</p>
        </div>
        <div className={`rounded-xl border px-4 py-3 text-center ${sinDatos > 0 ? 'bg-amber-50 border-amber-100' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-black ${sinDatos > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{sinDatos}</p>
          <p className={`text-xs mt-0.5 ${sinDatos > 0 ? 'text-amber-600' : 'text-gray-400'}`}>Sin datos</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/imagen"
            target="_blank"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            <FileText size={15} />
            Ver informe público
          </Link>
          <Link
            href="/clipping"
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
          >
            <Sparkles size={15} />
            Clipping IA
          </Link>
          <button onClick={handleSeedSC} disabled={seedLoading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            🗺️ {seedLoading ? 'Cargando...' : 'Cargar alertas reales SC'}
          </button>
          <button onClick={handleScanSC} disabled={scanLoading}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 disabled:opacity-50 transition-colors">
            🗺️ {scanLoading ? 'Escaneando...' : 'Escanear alertas SC'}
          </button>
          <button onClick={handleTriggerAnalisis} disabled={triggerLoading}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 disabled:opacity-50 transition-colors">
            <BarChart2 size={16} />
            {triggerLoading ? 'Analizando...' : 'Ejecutar análisis (RSS)'}
          </button>
          <button
            onClick={async () => {
              if (!confirm(`LIMPIAR datos extremos (100%/0%) y RE-ANALIZAR los ${politicos.length} políticos con IA?\n\nTarda ~1-2 min.`)) return
              setIaMsg(`⏳ Limpiando datos extremos del historial...`)
              const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'

              // Paso 1: limpiar basura
              try {
                const cleanRes = await fetch('/api/limpiar-extremos', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${secret}` },
                })
                const cleanData = await cleanRes.json()
                setIaMsg(`🧹 ${cleanData.borradasExtremos ?? 0} extremos + ${cleanData.borradasPocasMenciones ?? 0} pocas menciones eliminados. Re-analizando con IA...`)
              } catch {
                setIaMsg(`⚠ Error limpiando, sigo igual...`)
              }

              await new Promise(r => setTimeout(r, 500))

              // Paso 2: re-analizar todos con IA — 5s entre llamadas (límite gratis: 15 req/min)
              let ok = 0
              let fail = 0
              let cuotaAgotada = false
              for (let i = 0; i < politicos.length; i++) {
                if (cuotaAgotada) break
                const p = politicos[i]
                setIaMsg(`⏳ Analizando ${p.nombre} (${i + 1}/${politicos.length}) · ~${Math.ceil((politicos.length - i) * 5 / 60)} min restantes`)
                try {
                  const res = await fetch('/api/analizar-politico-ia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
                    body: JSON.stringify({ politicoId: p.id }),
                  })
                  if (res.ok) {
                    ok++
                  } else {
                    fail++
                    const data = await res.json().catch(() => ({}))
                    if (String(data.error ?? '').toLowerCase().includes('cuota')) {
                      cuotaAgotada = true
                      setIaMsg(`⚠ Cuota agotada · ${ok} OK · esperá 1 min y reintentá`)
                    }
                  }
                } catch { fail++ }
                if (!cuotaAgotada) await new Promise(r => setTimeout(r, 5000))
              }
              if (!cuotaAgotada) setIaMsg(`✓ Listo · ${ok} actualizados con IA · ${fail} fallidos`)
              router.refresh()
            }}
            disabled={iaLoadingId !== null}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors">
            <Wand2 size={15} />
            Limpiar + Re-analizar con IA
          </button>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>

      {/* Mensajes de resultado */}
      {seedMsg && (
        <div className={`text-sm px-4 py-2 rounded-lg ${seedMsg.startsWith('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {seedMsg}
          {seedMsg.includes('tabla problematicas_sc') && (
            <details className="mt-2">
              <summary className="cursor-pointer font-bold text-xs">Ver SQL para crear la tabla →</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto whitespace-pre-wrap">
{`CREATE TABLE problematicas_sc (
  id SERIAL PRIMARY KEY,
  localidad_slug TEXT NOT NULL,
  localidad_nombre TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'General',
  titulo TEXT NOT NULL,
  fuente_nombre TEXT NOT NULL DEFAULT '',
  url TEXT UNIQUE,
  severidad SMALLINT NOT NULL DEFAULT 1,
  publicado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE problematicas_sc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prob_read" ON problematicas_sc FOR SELECT USING (true);
CREATE POLICY "prob_write" ON problematicas_sc FOR ALL USING (true) WITH CHECK (true);`}
              </pre>
            </details>
          )}
        </div>
      )}
      {iaMsg && (
        <div className={`text-sm px-4 py-2 rounded-lg ${iaMsg.startsWith('✓') ? 'bg-violet-50 text-violet-700' : iaMsg.startsWith('⏳') ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'}`}>
          {iaMsg}
        </div>
      )}
      {scanMsg && (
        <div className={`text-sm px-4 py-2 rounded-lg ${scanMsg.startsWith('✓') ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'}`}>
          {scanMsg}
        </div>
      )}
      {triggerMsg && (
        <div className={`text-sm px-4 py-2 rounded-lg ${triggerMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {triggerMsg}
        </div>
      )}

      {/* Formulario nuevo político */}
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
              placeholder="Partido (ej: SER, UxP)"
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
              <p className="text-xs text-gray-400 mt-1">Ej: Pablo Grasso, Grasso, intendente Río Gallegos</p>
            </div>
            <input value={facebookPageId} onChange={e => setFacebookPageId(e.target.value)}
              placeholder="Facebook Page ID (opcional)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <input value={fotoUrl} onChange={e => setFotoUrl(e.target.value)}
              placeholder="URL de foto (opcional)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={enTesteo} onChange={e => setEnTesteo(e.target.checked)} className="rounded" />
            En testeo (no visible públicamente)
          </label>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !nombre.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 text-sm hover:text-gray-800">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de políticos */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 w-8">#</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Cargo / Partido</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Img +</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Img −</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nivel</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {politicos.map((p: PoliticoDB, i: number) => (
              <Fragment key={p.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/imagen/${p.slug}`}
                      target="_blank"
                      className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-600 capitalize text-xs">{p.cargo}</span>
                      {p.partido_nombre && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: p.partido_color ?? '#94a3b8' }} />
                          <span className="text-[11px] text-gray-400">{p.partido_nombre}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.imagenActual ? (
                      <span className="font-black text-green-600">
                        {p.imagenActual.imagenPositiva.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.imagenActual ? (
                      <span className="font-black text-red-500">
                        {p.imagenActual.imagenNegativa.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.imagenActual ? (
                      <NivelBadge pct={p.imagenActual.imagenPositiva} />
                    ) : (
                      <span className="text-[10px] text-gray-400">Sin datos</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.en_testeo ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {p.en_testeo ? 'Testeo' : 'Activo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Ver informe individual */}
                      <Link
                        href={`/imagen/${p.slug}`}
                        target="_blank"
                        title="Ver informe"
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-2 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink size={11} />
                        Informe
                      </Link>
                      {/* Analizar con IA */}
                      <button
                        onClick={() => analizarConIA(p.id, p.nombre)}
                        disabled={iaLoadingId === p.id}
                        className="flex items-center gap-1 text-xs text-violet-700 hover:text-violet-900 border border-violet-200 hover:border-violet-400 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        title="Analizar imagen con IA (Gemini)"
                      >
                        <Wand2 size={11} />
                        {iaLoadingId === p.id ? '...' : 'IA'}
                      </button>
                      {/* Cargar % manual */}
                      <button
                        onClick={() => {
                          setEditImgId(editImgId === p.id ? null : p.id)
                          setImgPos(''); setImgNeg('')
                        }}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2 py-1.5 rounded-lg transition-colors"
                        title="Cargar % manualmente"
                      >
                        <Edit2 size={11} />
                        Manual
                      </button>
                      {/* Eliminar */}
                      <button onClick={() => handleDelete(p.id, p.nombre)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                        title="Eliminar político">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Fila expandida para cargar imagen manual */}
                {editImgId === p.id && (
                  <tr className="bg-blue-50">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-blue-700">
                          Cargar imagen para <strong>{p.nombre}</strong>:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={13} className="text-green-600" />
                          <input
                            type="number" min="0" max="100" step="0.1"
                            value={imgPos}
                            onChange={e => setImgPos(e.target.value)}
                            placeholder="Positiva %"
                            className="border rounded-lg px-2 py-1.5 text-xs w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingDown size={13} className="text-red-500" />
                          <input
                            type="number" min="0" max="100" step="0.1"
                            value={imgNeg}
                            onChange={e => setImgNeg(e.target.value)}
                            placeholder="Negativa %"
                            className="border rounded-lg px-2 py-1.5 text-xs w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <p className="text-[11px] text-blue-600">
                          Se agrega al historial de imagen.
                        </p>
                        <div className="flex gap-1.5 ml-auto">
                          <button
                            onClick={() => guardarImagenManual(p.id)}
                            disabled={savingImg || !imgPos || !imgNeg}
                            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Check size={11} />
                            {savingImg ? '...' : 'Guardar'}
                          </button>
                          <button
                            onClick={() => setEditImgId(null)}
                            className="text-gray-500 px-2 py-1.5 rounded-lg text-xs hover:text-gray-800 border hover:border-gray-400"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
