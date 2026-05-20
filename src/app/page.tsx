import Link from 'next/link'
import { MapPin, TrendingUp, Newspaper, GitCompare, BarChart3, FileText, Sparkles, Activity, ArrowUpRight, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils/date'

export const revalidate = 300

const MODULES = [
  { num: '01', icon: TrendingUp, label: 'Imagen Política',     href: '/imagen',     desc: 'Ranking de imagen positiva y negativa con IA desde medios y redes.' },
  { num: '02', icon: Activity,   label: 'Tablero Santa Cruz',  href: '/santa-cruz',  desc: 'Alertas por localidad, semáforo de riesgo y perfil de intendentes.' },
  { num: '03', icon: MapPin,     label: 'Mapa Político',       href: '/mapa',        desc: 'Argentina coloreada por partido. Drill-down a departamentos.' },
  { num: '04', icon: Newspaper,  label: 'Monitor de Noticias', href: '/noticias',    desc: 'Feed en tiempo real filtrado por provincia y medio local.' },
  { num: '05', icon: GitCompare, label: 'Comparar Candidatos', href: '/comparar',    desc: 'Análisis side-by-side de imagen, menciones y tendencias.' },
  { num: '06', icon: BarChart3,  label: 'Encuestas',           href: '/encuestas',   desc: 'BC Consultora · Atlas Intel. Intención de voto e imagen.' },
  { num: '07', icon: FileText,   label: 'Informe PDF',         href: '/informe',     desc: 'Perfil completo de cualquier político como informe profesional.' },
  { num: '08', icon: Sparkles,   label: 'Clipping IA',         href: '/clipping',    desc: 'Resumen político diario generado por inteligencia artificial.' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const [{ count: totalPoliticos }, { data: ultimaImagen }, { data: { user } }] = await Promise.all([
    supabase.from('politicos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('imagen_historico').select('calculado_at').order('calculado_at', { ascending: false }).limit(1),
    supabase.auth.getUser(),
  ])
  const ultimaActualizacion = ultimaImagen?.[0]?.calculado_at
    ? timeAgo(ultimaImagen[0].calculado_at)
    : 'sin datos'
  const noLogueado = !user

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8">

      {noLogueado && (
        <div className="mt-4 mb-2 flex items-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-3 flex-wrap">
          <Lock size={14} className="text-[#E31E24] flex-shrink-0" />
          <p className="text-xs sm:text-sm flex-1 min-w-0">
            <span className="font-bold">Acceso restringido.</span>{' '}
            <span className="text-gray-300">
              Iniciá sesión para acceder a los módulos de monitoreo, alertas y análisis político.
            </span>
          </p>
          <Link
            href="/admin/login"
            className="text-xs font-bold bg-[#E31E24] hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Iniciar sesión →
          </Link>
        </div>
      )}

      {/* ═════════════════ HERO (compacto) ═════════════════ */}
      <section className="pt-10 pb-8 lg:pt-14 lg:pb-10">

        <div className="anim-rule hero-rule mb-5" />

        <p className="anim-rise-1 eyebrow mb-5">
          Edición Mayo · Santa Cruz, Argentina
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">

          <h1
            className="anim-rise-2 lg:col-span-7"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
              fontWeight: 600,
              lineHeight: 0.95,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
            }}
          >
            Decisiones de campaña con{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--wine)', fontWeight: 500 }}>
              datos reales
            </em>
            .
          </h1>

          <div className="anim-rise-3 lg:col-span-5 flex flex-col gap-4">
            <p
              className="text-sm leading-relaxed"
              style={{
                color: 'var(--ink-soft)',
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              Consultora de inteligencia política. Monitoreo de medios y análisis
              electoral.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/tablero"
                className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-semibold uppercase"
              >
                Acceder al tablero
                <ArrowUpRight size={12} />
              </Link>
              <Link
                href="/admin"
                className="btn-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-semibold uppercase"
              >
                Acceder al admin
              </Link>
              <Link
                href="/clipping"
                className="btn-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-semibold uppercase"
              >
                Solicitar clipping
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════ STATS BAR (slim) ═════════════════ */}
      <section
        className="anim-rise-4 grid grid-cols-2 md:grid-cols-4 py-5"
        style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}
      >
        {[
          { val: String(totalPoliticos ?? 0), label: 'Políticos monitoreados' },
          { val: '16',                         label: 'Localidades en SC' },
          { val: '27+',                        label: 'Alertas verificadas / sem' },
          { val: ultimaActualizacion,          label: 'Último análisis', small: true },
        ].map(({ val, label, small }, i) => (
          <div
            key={label}
            className={`px-5 ${i < 3 ? 'md:border-r' : ''}`}
            style={{ borderColor: 'var(--hairline)' }}
          >
            <p
              style={{
                fontFamily: small ? 'var(--font-dm-sans)' : 'var(--font-cormorant), Georgia, serif',
                fontSize: small ? '0.95rem' : 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: small ? 600 : 600,
                lineHeight: 1,
                color: 'var(--ink)',
              }}
            >
              {val}
            </p>
            <p
              className="text-[9px] tracking-[0.18em] uppercase mt-1.5"
              style={{ color: 'var(--ink-light)' }}
            >
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* ═════════════════ MODULES ═════════════════ */}
      <section className="anim-rise-5 py-8 lg:py-10">
        <div className="flex items-center gap-4 mb-6">
          <p className="eyebrow flex-shrink-0">Módulos · 08 herramientas</p>
          <div className="h-px flex-1" style={{ background: 'var(--hairline)' }} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 -mx-px">
          {MODULES.map(({ num, icon: Icon, label, desc, href }) => (
            <Link
              key={href}
              href={href}
              className="module-card flex flex-col p-5 lg:p-6 min-h-[180px] -ml-px -mt-px"
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="module-num text-[10px] tracking-wider transition-colors"
                  style={{ color: 'var(--ink-light)', fontFamily: 'var(--font-jetbrains), monospace' }}
                >
                  {num} · 08
                </span>
                <Icon size={15} style={{ color: 'var(--ink-muted)' }} />
              </div>
              <div className="flex-1">
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    lineHeight: 1.1,
                    color: 'var(--ink)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {label}
                </h3>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  {desc}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 module-arrow text-[9px] font-semibold uppercase tracking-[0.18em]">
                Explorar
                <ArrowUpRight size={10} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═════════════════ EDITORIAL BLOCK ═════════════════ */}
      <section className="py-16 lg:py-20" style={{ borderTop: '1px solid var(--hairline)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-1 hidden lg:block">
            <div className="hero-rule" />
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6">Metodología</p>
            <p
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                fontWeight: 400,
                lineHeight: 1.3,
                letterSpacing: '-0.015em',
                color: 'var(--ink)',
              }}
            >
              <em>&laquo; </em>Cada análisis combina encuestas profesionales,
              monitoreo automatizado de medios locales y nacionales, y procesamiento con
              inteligencia artificial. <em>No vendemos opiniones. Vendemos evidencia.&raquo;</em>
            </p>
          </div>
          <div className="lg:col-span-4 lg:pl-8 space-y-4">
            {[
              { k: 'Fuentes', v: '25+ medios verificados' },
              { k: 'Frecuencia', v: 'Análisis cada 6 horas' },
              { k: 'Cobertura', v: 'Santa Cruz · Nacional' },
              { k: 'Encuestadoras', v: 'BC · Atlas · Opina' },
            ].map(({ k, v }) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-4 pb-3"
                style={{ borderBottom: '1px solid var(--hairline)' }}
              >
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--ink-light)' }}>{k}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
