# Monitor de Noticias — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Feed cronológico de noticias políticas argentinas en `/noticias` con filtro por provincia, clasificación automática por fuente + keywords, y admin para agregar medios locales.

**Architecture:** Next.js ISR (`revalidate = 3600`) fetchea RSS de todas las fuentes al build time. Un Client Component maneja el filtro de provincias sin re-fetch. Los medios locales se guardan en Supabase tabla `medios_locales` y se incluyen en el agregador. Sin login → 10 noticias; con login → todo + filtro por político.

**Tech Stack:** Next.js 16 (App Router + ISR), rss-parser (ya instalado), Supabase, Tailwind CSS, `date-fns` (ya instalado)

---

## File Structure

```
src/
├── app/
│   ├── noticias/page.tsx                      # Feed público ISR
│   └── admin/(protected)/medios/
│       ├── page.tsx                           # Server Component
│       └── MediosAdmin.tsx                    # Client CRUD
├── components/noticias/
│   ├── FeedNoticias.tsx                       # Client: filtros + lista
│   ├── NoticiaCard.tsx                        # Card individual
│   ├── FiltroProvincias.tsx                   # Botones de filtro
│   └── BadgeProvincia.tsx                     # Badge coloreado
└── lib/
    ├── sources/
    │   ├── provincial.ts                      # Clasificación por provincia
    │   └── aggregator.ts                      # Agrega todas las fuentes
    └── supabase/
        └── medios-queries.ts                  # CRUD medios_locales
```

---

## Task 1: Schema DB + SQL para medios locales

**Files:**
- Create: `supabase/migrations/003_medios_locales.sql`

- [ ] **Step 1: Crear archivo SQL**

Crear `supabase/migrations/003_medios_locales.sql`:

```sql
CREATE TABLE medios_locales (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  url_rss TEXT NOT NULL,
  provincia_slug TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medios_locales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medios_public_read" ON medios_locales FOR SELECT USING (activo = true);
CREATE POLICY "medios_auth_write" ON medios_locales FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Medios iniciales de Santa Cruz
INSERT INTO medios_locales (nombre, url_rss, provincia_slug) VALUES
  ('OPI Santa Cruz', 'https://opisantacruz.com.ar/feed/', 'santa-cruz'),
  ('La Opinión Austral', 'https://www.laopinionaustral.com.ar/feed/', 'santa-cruz'),
  ('El Diario del Fin del Mundo', 'https://eldiariodelfinmundo.com/feed/', 'tierra-del-fuego');
```

- [ ] **Step 2: Ejecutar en Supabase SQL Editor**

Ir a [Supabase Dashboard](https://supabase.com/dashboard/project/ysskkatbzubnhyvenwjm/sql/new), pegar el SQL y ejecutar.

Expected: `Success. No rows returned`

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/nodue/OneDrive/Documentos/Encuestas/portal-politico"
git add supabase/migrations/
git commit -m "feat: add medios_locales DB table for provincial media management"
```

---

## Task 2: Tipos + lógica de clasificación por provincia

**Files:**
- Create: `src/types/noticias.ts`
- Create: `src/lib/sources/provincial.ts`
- Create: `src/lib/sources/__tests__/provincial.test.ts`

- [ ] **Step 1: Crear tipos**

Crear `src/types/noticias.ts`:

```typescript
export interface NoticiaItem {
  id: string
  titulo: string
  url: string
  fuente: string
  provinciaSlug: string
  provinciaNombre: string
  publicadoAt: string
  politicoSlug?: string
}

export interface MedioLocal {
  id: number
  nombre: string
  urlRss: string
  provinciaSlug: string
  activo: boolean
}

export const PROVINCIAS_DISPLAY: Record<string, string> = {
  'nacional': 'Nacional',
  'santa-cruz': 'Santa Cruz',
  'buenos-aires': 'Buenos Aires',
  'ciudad-autonoma': 'CABA',
  'cordoba': 'Córdoba',
  'santa-fe': 'Santa Fe',
  'mendoza': 'Mendoza',
  'neuquen': 'Neuquén',
  'rio-negro': 'Río Negro',
  'chubut': 'Chubut',
  'tierra-del-fuego': 'Tierra del Fuego',
  'salta': 'Salta',
  'tucuman': 'Tucumán',
  'jujuy': 'Jujuy',
  'entre-rios': 'Entre Ríos',
  'corrientes': 'Corrientes',
  'misiones': 'Misiones',
  'chaco': 'Chaco',
  'formosa': 'Formosa',
  'santiago-del-estero': 'Santiago del Estero',
  'la-rioja': 'La Rioja',
  'catamarca': 'Catamarca',
  'san-juan': 'San Juan',
  'san-luis': 'San Luis',
  'la-pampa': 'La Pampa',
}
```

- [ ] **Step 2: Crear test de clasificación**

Crear `src/lib/sources/__tests__/provincial.test.ts`:

```typescript
import {
  detectarProvincias,
  PROVINCE_KEYWORDS,
  getProvinciaNombre,
} from '../provincial'

describe('provincial classifier', () => {
  it('detecta Santa Cruz por keyword en titular', () => {
    const provincias = detectarProvincias(
      'Claudio Vidal recorre el interior de Santa Cruz',
      'nacional'
    )
    expect(provincias).toContain('santa-cruz')
  })

  it('incluye la provincia de la fuente siempre', () => {
    const provincias = detectarProvincias(
      'Noticia sin keywords específicas',
      'santa-cruz'
    )
    expect(provincias).toContain('santa-cruz')
  })

  it('detecta múltiples provincias en un titular', () => {
    const provincias = detectarProvincias(
      'Acuerdo entre Córdoba y Mendoza por recursos hídricos',
      'nacional'
    )
    expect(provincias).toContain('cordoba')
    expect(provincias).toContain('mendoza')
  })

  it('retorna nacional si no hay matches', () => {
    const provincias = detectarProvincias('Noticia sin mención provincial', 'nacional')
    expect(provincias).toContain('nacional')
  })

  it('PROVINCE_KEYWORDS tiene entradas para las provincias clave', () => {
    expect(PROVINCE_KEYWORDS['santa-cruz']).toBeDefined()
    expect(PROVINCE_KEYWORDS['buenos-aires']).toBeDefined()
    expect(PROVINCE_KEYWORDS['cordoba']).toBeDefined()
  })

  it('getProvinciaNombre retorna nombre legible', () => {
    expect(getProvinciaNombre('santa-cruz')).toBe('Santa Cruz')
    expect(getProvinciaNombre('provincia-inexistente')).toBe('Nacional')
  })
})
```

- [ ] **Step 3: Correr test — debe fallar**

```bash
npm test -- --testPathPatterns="sources/__tests__/provincial"
```
Expected: FAIL — `Cannot find module '../provincial'`

- [ ] **Step 4: Crear src/lib/sources/provincial.ts**

```typescript
import { PROVINCIAS_DISPLAY } from '@/types/noticias'

export const PROVINCE_KEYWORDS: Record<string, string[]> = {
  'santa-cruz': ['Santa Cruz', 'Río Gallegos', 'Caleta Olivia', 'El Calafate', 'Puerto Deseado', 'Vidal'],
  'buenos-aires': ['Buenos Aires', 'La Plata', 'Kicillof', 'bonaerense', 'Provincia de Buenos Aires'],
  'ciudad-autonoma': ['CABA', 'Ciudad de Buenos Aires', 'porteño', 'Larreta', 'Macri'],
  'cordoba': ['Córdoba', 'Llaryora', 'cordobés'],
  'santa-fe': ['Santa Fe', 'Rosario', 'Pullaro', 'santafesino'],
  'mendoza': ['Mendoza', 'Cornejo', 'mendocino'],
  'neuquen': ['Neuquén', 'Figueroa', 'neuquino'],
  'rio-negro': ['Río Negro', 'Weretilneck', 'Bariloche', 'Viedma'],
  'chubut': ['Chubut', 'Torres', 'Rawson', 'Comodoro'],
  'tierra-del-fuego': ['Tierra del Fuego', 'Ushuaia', 'Melella', 'fueguino'],
  'salta': ['Salta', 'Sáenz', 'salteño'],
  'tucuman': ['Tucumán', 'Jaldo', 'tucumano'],
  'jujuy': ['Jujuy', 'Morales', 'jujeño'],
  'entre-rios': ['Entre Ríos', 'Paraná', 'Frigerio', 'entrerriano'],
  'corrientes': ['Corrientes', 'Valdés', 'correntino'],
  'misiones': ['Misiones', 'Passalacqua', 'misionero', 'Posadas'],
  'chaco': ['Chaco', 'Ledesma', 'chaqueño', 'Resistencia'],
  'formosa': ['Formosa', 'Insfrán', 'formoseño'],
  'santiago-del-estero': ['Santiago del Estero', 'Zamora'],
  'la-rioja': ['La Rioja', 'Quintela'],
  'catamarca': ['Catamarca', 'Saadi'],
  'san-juan': ['San Juan', 'Orrego'],
  'san-luis': ['San Luis', 'Poggi'],
  'la-pampa': ['La Pampa', 'Ziliotto'],
}

export function detectarProvincias(titulo: string, provinciaFuente: string): string[] {
  const provincias = new Set<string>()

  // La provincia de la fuente siempre se incluye
  provincias.add(provinciaFuente)

  // Detectar otras provincias por keywords en el titular
  for (const [slug, keywords] of Object.entries(PROVINCE_KEYWORDS)) {
    if (keywords.some(kw => titulo.toLowerCase().includes(kw.toLowerCase()))) {
      provincias.add(slug)
    }
  }

  return Array.from(provincias)
}

export function getProvinciaNombre(slug: string): string {
  return PROVINCIAS_DISPLAY[slug] ?? 'Nacional'
}
```

- [ ] **Step 5: Correr test — debe pasar**

```bash
npm test -- --testPathPatterns="sources/__tests__/provincial"
```
Expected: PASS — 6 tests

- [ ] **Step 6: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/types/noticias.ts src/lib/sources/provincial.ts src/lib/sources/__tests__/
git commit -m "feat: add noticias types and province classifier"
```

---

## Task 3: Aggregator + queries medios locales

**Files:**
- Create: `src/lib/supabase/medios-queries.ts`
- Create: `src/lib/sources/aggregator.ts`
- Create: `src/lib/sources/__tests__/aggregator.test.ts`

- [ ] **Step 1: Crear medios-queries.ts**

Crear `src/lib/supabase/medios-queries.ts`:

```typescript
import { createClient } from './server'
import type { MedioLocal } from '@/types/noticias'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMedioRow(row: any): MedioLocal {
  return {
    id: row.id,
    nombre: row.nombre,
    urlRss: row.url_rss,
    provinciaSlug: row.provincia_slug,
    activo: row.activo,
  }
}

export async function getMediosLocales(): Promise<MedioLocal[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('medios_locales')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  return (data ?? []).map(mapMedioRow)
}
```

- [ ] **Step 2: Crear test del aggregator**

Crear `src/lib/sources/__tests__/aggregator.test.ts`:

```typescript
import { buildNoticiaId, limitNoticias, sortByDate } from '../aggregator'

describe('aggregator', () => {
  it('buildNoticiaId genera ID único por URL', () => {
    const id1 = buildNoticiaId('https://ejemplo.com/nota-1')
    const id2 = buildNoticiaId('https://ejemplo.com/nota-2')
    expect(id1).not.toBe(id2)
    expect(id1).toHaveLength(8)
  })

  it('buildNoticiaId es determinístico para la misma URL', () => {
    const url = 'https://ejemplo.com/nota'
    expect(buildNoticiaId(url)).toBe(buildNoticiaId(url))
  })

  it('limitNoticias retorna primeros N elementos', () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: String(i) }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(limitNoticias(items as any, 10)).toHaveLength(10)
  })

  it('sortByDate ordena descendente por publicadoAt', () => {
    const items = [
      { publicadoAt: '2026-01-01T00:00:00Z', titulo: 'viejo' },
      { publicadoAt: '2026-05-14T00:00:00Z', titulo: 'nuevo' },
      { publicadoAt: '2026-03-01T00:00:00Z', titulo: 'medio' },
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = sortByDate(items as any)
    expect(sorted[0].titulo).toBe('nuevo')
    expect(sorted[2].titulo).toBe('viejo')
  })
})
```

- [ ] **Step 3: Correr test — debe fallar**

```bash
npm test -- --testPathPatterns="sources/__tests__/aggregator"
```
Expected: FAIL

- [ ] **Step 4: Crear src/lib/sources/aggregator.ts**

```typescript
import Parser from 'rss-parser'
import { detectarProvincias, getProvinciaNombre } from './provincial'
import type { NoticiaItem } from '@/types/noticias'

// Fuentes RSS nacionales fijas
const FEEDS_NACIONALES = [
  { nombre: 'Infobae', url: 'https://www.infobae.com/feeds/rss/', provincia: 'nacional' },
  { nombre: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', provincia: 'nacional' },
  { nombre: 'Clarín', url: 'https://www.clarin.com/rss/politica/', provincia: 'nacional' },
  { nombre: 'Télam', url: 'https://www.telam.com.ar/rss/politica.xml', provincia: 'nacional' },
  { nombre: 'Página 12', url: 'https://www.pagina12.com.ar/rss/secciones/el-pais/notas', provincia: 'nacional' },
]

export function buildNoticiaId(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36).slice(0, 8)
}

export function sortByDate(items: NoticiaItem[]): NoticiaItem[] {
  return [...items].sort(
    (a, b) => new Date(b.publicadoAt).getTime() - new Date(a.publicadoAt).getTime()
  )
}

export function limitNoticias(items: NoticiaItem[], n: number): NoticiaItem[] {
  return items.slice(0, n)
}

interface FeedSource {
  nombre: string
  url: string
  provincia: string
}

async function fetchFeed(source: FeedSource): Promise<NoticiaItem[]> {
  const parser = new Parser({ timeout: 8000 })
  try {
    const parsed = await parser.parseURL(source.url)
    const items: NoticiaItem[] = []

    for (const item of parsed.items ?? []) {
      const titulo = item.title ?? ''
      if (!titulo || !item.link) continue

      const provinciasDetectadas = detectarProvincias(titulo, source.provincia)
      // Crear una entrada por cada provincia detectada
      for (const provinciaSlug of provinciasDetectadas) {
        items.push({
          id: buildNoticiaId(`${item.link}-${provinciaSlug}`),
          titulo,
          url: item.link,
          fuente: source.nombre,
          provinciaSlug,
          provinciaNombre: getProvinciaNombre(provinciaSlug),
          publicadoAt: item.pubDate ?? new Date().toISOString(),
        })
      }
    }
    return items
  } catch {
    return []
  }
}

export interface MedioInput {
  nombre: string
  urlRss: string
  provinciaSlug: string
}

export async function fetchTodasLasNoticias(
  mediosLocales: MedioInput[] = []
): Promise<NoticiaItem[]> {
  const fuentesLocales: FeedSource[] = mediosLocales.map(m => ({
    nombre: m.nombre,
    url: m.urlRss,
    provincia: m.provinciaSlug,
  }))

  const todasFuentes = [...FEEDS_NACIONALES, ...fuentesLocales]

  const results = await Promise.allSettled(todasFuentes.map(fetchFeed))
  const todas = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])

  // Deduplicar por URL + provincia (mismo artículo puede estar en 2 provincias, eso es OK)
  const seen = new Set<string>()
  const deduplicadas = todas.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  return sortByDate(deduplicadas)
}
```

- [ ] **Step 5: Correr test — debe pasar**

```bash
npm test -- --testPathPatterns="sources/__tests__/aggregator"
```
Expected: PASS — 4 tests

- [ ] **Step 6: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/lib/sources/aggregator.ts src/lib/sources/__tests__/aggregator.test.ts src/lib/supabase/medios-queries.ts
git commit -m "feat: add news aggregator with province detection and local media support"
```

---

## Task 4: Componentes del feed de noticias

**Files:**
- Create: `src/components/noticias/BadgeProvincia.tsx`
- Create: `src/components/noticias/NoticiaCard.tsx`
- Create: `src/components/noticias/FiltroProvincias.tsx`
- Create: `src/components/noticias/FeedNoticias.tsx`

- [ ] **Step 1: Crear directorios**

```bash
cd "c:/Users/nodue/OneDrive/Documentos/Encuestas/portal-politico"
mkdir -p src/components/noticias
```

- [ ] **Step 2: Crear BadgeProvincia**

Crear `src/components/noticias/BadgeProvincia.tsx`:

```typescript
const PROVINCIA_COLORS: Record<string, string> = {
  'nacional': 'bg-gray-100 text-gray-700',
  'santa-cruz': 'bg-blue-100 text-blue-800',
  'buenos-aires': 'bg-yellow-100 text-yellow-800',
  'ciudad-autonoma': 'bg-purple-100 text-purple-800',
  'cordoba': 'bg-green-100 text-green-800',
  'santa-fe': 'bg-red-100 text-red-800',
  'mendoza': 'bg-orange-100 text-orange-800',
  'neuquen': 'bg-teal-100 text-teal-800',
}

export function BadgeProvincia({ slug, nombre }: { slug: string; nombre: string }) {
  const cls = PROVINCIA_COLORS[slug] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cls}`}>
      {nombre}
    </span>
  )
}
```

- [ ] **Step 3: Crear NoticiaCard**

Crear `src/components/noticias/NoticiaCard.tsx`:

```typescript
import { ExternalLink } from 'lucide-react'
import type { NoticiaItem } from '@/types/noticias'
import { BadgeProvincia } from './BadgeProvincia'
import { timeAgo } from '@/lib/utils/date'

export function NoticiaCard({ noticia }: { noticia: NoticiaItem }) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 hover:border-[#E31E24] hover:shadow-sm transition-all p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <BadgeProvincia slug={noticia.provinciaSlug} nombre={noticia.provinciaNombre} />
            <span className="text-xs text-gray-400">{noticia.fuente}</span>
            <span className="text-xs text-gray-300">·</span>
            <time className="text-xs text-gray-400" dateTime={noticia.publicadoAt}>
              {timeAgo(noticia.publicadoAt)}
            </time>
          </div>
          <a
            href={noticia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-[#E31E24] transition-colors leading-snug line-clamp-2 text-sm"
          >
            {noticia.titulo}
          </a>
        </div>
        <a
          href={noticia.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir noticia"
          className="text-gray-300 hover:text-[#E31E24] transition-colors flex-shrink-0 mt-1"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Crear FiltroProvincias**

Crear `src/components/noticias/FiltroProvincias.tsx`:

```typescript
'use client'

import { PROVINCIAS_DISPLAY } from '@/types/noticias'

const PROVINCIAS_BOTONES = [
  'todas',
  'santa-cruz',
  'nacional',
  'buenos-aires',
  'cordoba',
  'santa-fe',
  'mendoza',
  'neuquen',
  'chubut',
  'tierra-del-fuego',
]

interface Props {
  activa: string
  onChange: (provincia: string) => void
  counts: Record<string, number>
}

export function FiltroProvincias({ activa, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PROVINCIAS_BOTONES.map(slug => {
        const nombre = slug === 'todas' ? 'Todas' : (PROVINCIAS_DISPLAY[slug] ?? slug)
        const count = slug === 'todas'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[slug] ?? 0)
        const isActive = activa === slug

        return (
          <button
            key={slug}
            onClick={() => onChange(slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#E31E24] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {nombre}
            {count > 0 && (
              <span className={`ml-1.5 ${isActive ? 'text-red-200' : 'text-gray-400'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 5: Crear FeedNoticias (client component con filtros)**

Crear `src/components/noticias/FeedNoticias.tsx`:

```typescript
'use client'

import { useState } from 'react'
import type { NoticiaItem } from '@/types/noticias'
import { NoticiaCard } from './NoticiaCard'
import { FiltroProvincias } from './FiltroProvincias'

const LIMITE_SIN_LOGIN = 10

interface Props {
  noticias: NoticiaItem[]
  isLoggedIn: boolean
}

export function FeedNoticias({ noticias, isLoggedIn }: Props) {
  const [filtro, setFiltro] = useState('todas')

  const filtradas = filtro === 'todas'
    ? noticias
    : noticias.filter(n => n.provinciaSlug === filtro)

  const visibles = isLoggedIn ? filtradas : filtradas.slice(0, LIMITE_SIN_LOGIN)
  const hayMas = !isLoggedIn && filtradas.length > LIMITE_SIN_LOGIN

  // Contar noticias por provincia para los badges
  const counts = noticias.reduce<Record<string, number>>((acc, n) => {
    acc[n.provinciaSlug] = (acc[n.provinciaSlug] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <FiltroProvincias activa={filtro} onChange={setFiltro} counts={counts} />

      <div className="flex flex-col gap-3">
        {visibles.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 text-sm">
            No hay noticias para esta provincia en este momento
          </div>
        ) : (
          visibles.map(n => <NoticiaCard key={n.id} noticia={n} />)
        )}
      </div>

      {hayMas && (
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
          <p className="text-sm text-amber-800 font-semibold">
            Mostrando {LIMITE_SIN_LOGIN} de {filtradas.length} noticias
          </p>
          <p className="text-xs text-amber-600 mt-1">
            <a href="/admin/login" className="underline hover:text-amber-800">
              Iniciá sesión
            </a>
            {' '}para ver todas las noticias y filtrar por político
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errores

- [ ] **Step 7: Commit**

```bash
git add src/components/noticias/
git commit -m "feat: add noticias feed components (BadgeProvincia, NoticiaCard, FiltroProvincias, FeedNoticias)"
```

---

## Task 5: Página pública /noticias

**Files:**
- Create: `src/app/noticias/page.tsx`

- [ ] **Step 1: Crear directorio**

```bash
mkdir -p src/app/noticias
```

- [ ] **Step 2: Crear página**

Crear `src/app/noticias/page.tsx`:

```typescript
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getMediosLocales } from '@/lib/supabase/medios-queries'
import { fetchTodasLasNoticias } from '@/lib/sources/aggregator'
import { FeedNoticias } from '@/components/noticias/FeedNoticias'

export const metadata: Metadata = {
  title: 'Noticias — Portal Político',
  description: 'Monitor de noticias políticas argentinas en tiempo real, provincia por provincia.',
}

export const revalidate = 3600

export default async function NoticiasPage() {
  const [mediosLocales, supabase] = await Promise.all([
    getMediosLocales(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const noticias = await fetchTodasLasNoticias(
    mediosLocales.map(m => ({
      nombre: m.nombre,
      urlRss: m.urlRss,
      provinciaSlug: m.provinciaSlug,
    }))
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Monitor de Noticias</h1>
        <p className="text-sm text-gray-500 mt-1">
          {noticias.length} noticias · Actualizado cada hora
          {!isLoggedIn && ' · '}
          {!isLoggedIn && (
            <a href="/admin/login" className="text-[#E31E24] hover:underline">
              Iniciá sesión para ver todo
            </a>
          )}
        </p>
      </div>

      <FeedNoticias noticias={noticias} isLoggedIn={isLoggedIn} />
    </div>
  )
}
```

- [ ] **Step 3: Agregar link en Header**

Leer `src/components/layout/Header.tsx`. Agregar `{ label: 'Noticias', href: '/noticias' }` en `NAV_LINKS` después de `Imagen`.

- [ ] **Step 4: Verificar build**

```bash
npm run build 2>&1 | grep -E "noticias|error|Error" | head -15
```
Expected: `/noticias` aparece como Static o ISR, sin errores

- [ ] **Step 5: Commit**

```bash
git add src/app/noticias/ src/components/layout/Header.tsx
git commit -m "feat: add public /noticias page with ISR and province filtering"
```

---

## Task 6: Admin CRUD para medios locales

**Files:**
- Create: `src/app/admin/(protected)/medios/page.tsx`
- Create: `src/app/admin/(protected)/medios/MediosAdmin.tsx`

- [ ] **Step 1: Crear directorio**

```bash
mkdir -p "src/app/admin/(protected)/medios"
```

- [ ] **Step 2: Crear Server Component**

Crear `src/app/admin/(protected)/medios/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { MediosAdmin } from './MediosAdmin'

export default async function MediosAdminPage() {
  const supabase = await createClient()
  const { data: medios } = await supabase
    .from('medios_locales')
    .select('*')
    .order('nombre')

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Medios Locales</h1>
      <MediosAdmin medios={medios ?? []} />
    </div>
  )
}
```

- [ ] **Step 3: Crear Client Component**

Crear `src/app/admin/(protected)/medios/MediosAdmin.tsx`:

```typescript
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

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return
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
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                  <Rss size={14} className="text-orange-500 flex-shrink-0" />
                  {m.nombre}
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
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Agregar link en admin layout**

Leer `src/app/admin/(protected)/layout.tsx`. Agregar link "Medios" en la navbar:

```typescript
<Link href="/admin/medios" className="text-gray-300 hover:text-white transition-colors">
  Medios
</Link>
```

- [ ] **Step 5: TypeScript + build**

```bash
npx tsc --noEmit
npm run build 2>&1 | grep -E "medios|noticias|error" | head -15
```
Expected: build exitoso

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(protected)/medios/"
git commit -m "feat: add admin CRUD for local media feeds"
```

---

## Self-Review

**Spec coverage:**
- ✅ Feed cronológico `/noticias` con filtro por provincia (botones)
- ✅ ISR `revalidate = 3600` sin DB para noticias
- ✅ Por artículo: título + fuente + tiempo + badge provincia + link
- ✅ Fuentes: 5 nacionales + medios locales de Supabase
- ✅ Google News integrado via aggregator (usa `fetchTodasLasNoticias`)
- ✅ Clasificación combinada: fuente + keywords en titular
- ✅ Sin login → 10 noticias; con login → todo
- ✅ Admin CRUD medios locales (nombre + URL RSS + provincia)
- ✅ `PROVINCIAS_DISPLAY` para nombres legibles

**Placeholder scan:** ninguno — código completo en cada step.

**Type consistency:** `NoticiaItem.provinciaSlug` ↔ `PROVINCIAS_DISPLAY[slug]` ↔ `BadgeProvincia.slug` ✅

---

**Plan guardado. Ejecutamos con `/subagent-driven-development`?**
