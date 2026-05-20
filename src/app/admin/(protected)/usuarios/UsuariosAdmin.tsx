'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Trash2, KeyRound, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react'
import type { Rol } from '@/lib/auth/permissions'

export type UsuarioRow = {
  id: string
  email: string
  rol: Rol
  createdAt: string
  lastSignIn: string | null
  emailConfirmed: boolean
}

type Props = {
  usuariosIniciales: UsuarioRow[]
  miUserId: string
}

function formatFecha(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function UsuariosAdmin({ usuariosIniciales, miUserId }: Props) {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>(usuariosIniciales)
  const [isPending, startTransition] = useTransition()
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  // Alta de usuario
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [nuevoRol, setNuevoRol] = useState<Rol>('user')

  async function recargar() {
    const r = await fetch('/api/admin/usuarios', { cache: 'no-store' })
    const data = await r.json()
    if (Array.isArray(data.users)) setUsuarios(data.users)
  }

  function refresh() {
    startTransition(() => {
      router.refresh()
      recargar()
    })
  }

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault()
    setErrorGlobal(null)
    setAccionEnCurso('crear')
    const r = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: nuevoEmail, password: nuevaPassword, rol: nuevoRol }),
    })
    const data = await r.json()
    setAccionEnCurso(null)
    if (!r.ok) {
      setErrorGlobal(data.error ?? 'Error al crear usuario')
      return
    }
    setNuevoEmail(''); setNuevaPassword(''); setNuevoRol('user')
    refresh()
  }

  async function cambiarRol(userId: string, nuevoRolObjetivo: Rol) {
    setAccionEnCurso(`rol-${userId}`)
    setErrorGlobal(null)
    const r = await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId, rol: nuevoRolObjetivo }),
    })
    const data = await r.json()
    setAccionEnCurso(null)
    if (!r.ok) {
      setErrorGlobal(data.error ?? 'Error al cambiar rol')
      return
    }
    refresh()
  }

  async function resetPassword(userId: string, email: string) {
    const nueva = window.prompt(`Nueva contraseña para ${email} (mínimo 6 caracteres):`)
    if (!nueva) return
    if (nueva.length < 6) {
      setErrorGlobal('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setAccionEnCurso(`pwd-${userId}`)
    setErrorGlobal(null)
    const r = await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId, password: nueva }),
    })
    const data = await r.json()
    setAccionEnCurso(null)
    if (!r.ok) {
      setErrorGlobal(data.error ?? 'Error al cambiar contraseña')
      return
    }
    window.alert(`Contraseña actualizada para ${email}`)
  }

  async function borrarUsuario(userId: string, email: string) {
    if (!window.confirm(`¿Borrar definitivamente al usuario ${email}? No se puede deshacer.`)) return
    setAccionEnCurso(`del-${userId}`)
    setErrorGlobal(null)
    const r = await fetch(`/api/admin/usuarios?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    })
    const data = await r.json()
    setAccionEnCurso(null)
    if (!r.ok) {
      setErrorGlobal(data.error ?? 'Error al borrar usuario')
      return
    }
    refresh()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestión de usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'} registrado(s) ·
            Los admins pueden entrar al panel; los users solo al portal público.
          </p>
        </div>
      </div>

      {errorGlobal && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
          {errorGlobal}
        </div>
      )}

      {/* Alta */}
      <div className="bg-white border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={16} className="text-[#E31E24]" />
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Agregar usuario</h2>
        </div>
        <form onSubmit={crearUsuario} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="email"
            required
            placeholder="email@ejemplo.com"
            value={nuevoEmail}
            onChange={e => setNuevoEmail(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="text"
            required
            placeholder="Contraseña (min 6)"
            value={nuevaPassword}
            onChange={e => setNuevaPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={nuevoRol}
            onChange={e => setNuevoRol(e.target.value as Rol)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="user">user (solo portal)</option>
            <option value="admin">admin (panel + portal)</option>
          </select>
          <button
            type="submit"
            disabled={accionEnCurso === 'crear'}
            className="bg-[#E31E24] text-white font-bold py-2 rounded-lg hover:bg-red-700 disabled:opacity-60 text-sm flex items-center justify-center gap-1.5"
          >
            {accionEnCurso === 'crear' ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Crear
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="text-left px-4 py-2.5 font-bold">Email</th>
              <th className="text-left px-4 py-2.5 font-bold">Rol</th>
              <th className="text-left px-4 py-2.5 font-bold">Creado</th>
              <th className="text-left px-4 py-2.5 font-bold">Último login</th>
              <th className="text-right px-4 py-2.5 font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map(u => {
              const esYo = u.id === miUserId
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{u.email}</div>
                    {esYo && <div className="text-[10px] text-gray-400">(vos)</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      u.rol === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatFecha(u.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatFecha(u.lastSignIn)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {u.rol === 'admin' ? (
                        <button
                          onClick={() => cambiarRol(u.id, 'user')}
                          disabled={esYo || accionEnCurso === `rol-${u.id}`}
                          title={esYo ? 'No podés quitarte tu propio rol' : 'Quitar admin'}
                          className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-amber-700 border border-gray-200 hover:border-amber-300 px-2 py-1 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShieldOff size={12} /> Quitar admin
                        </button>
                      ) : (
                        <button
                          onClick={() => cambiarRol(u.id, 'admin')}
                          disabled={accionEnCurso === `rol-${u.id}`}
                          className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-300 px-2 py-1 rounded-md disabled:opacity-40"
                        >
                          <ShieldCheck size={12} /> Hacer admin
                        </button>
                      )}
                      <button
                        onClick={() => resetPassword(u.id, u.email)}
                        disabled={accionEnCurso === `pwd-${u.id}`}
                        className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 px-2 py-1 rounded-md disabled:opacity-40"
                      >
                        <KeyRound size={12} /> Contraseña
                      </button>
                      <button
                        onClick={() => borrarUsuario(u.id, u.email)}
                        disabled={esYo || accionEnCurso === `del-${u.id}`}
                        title={esYo ? 'No podés borrar tu propio usuario' : 'Eliminar'}
                        className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-2 py-1 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={12} /> Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-sm text-gray-400">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isPending && (
        <p className="text-xs text-gray-400 mt-2">Actualizando…</p>
      )}
    </div>
  )
}
