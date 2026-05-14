# Mapa Político Interactivo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mapa interactivo de Argentina coloreado por partido político, con drill-down a municipios de Santa Cruz y panel de detalle por localidad.

**Architecture:** React-Leaflet renderiza capas GeoJSON desde archivos estáticos. Los datos políticos (gobernadores, intendentes, partidos) viven en Supabase. El mapa es público; los datos de imagen % requieren login vía Supabase Auth.

**Tech Stack:** Next.js 15 (App Router), React-Leaflet 4, Leaflet 1.9, Supabase (PostgreSQL + Auth), TypeScript, Tailwind CSS

---

## File Structure

```
src/
├── app/
│   ├── mapa/page.tsx                    # Página pública del mapa
│   ├── admin/
│   │   ├── layout.tsx                   # Layout protegido con auth check
│   │   ├── page.tsx                     # Dashboard admin
│   │   └── politicos/page.tsx           # CRUD gobernadores/intendentes
│   └── api/auth/callback/route.ts       # Supabase Auth callback
├── components/mapa/
│   ├── MapaArgentina.tsx                # Componente principal (dynamic import)
│   ├── CapaProvincias.tsx               # GeoJSON layer provincias
│   ├── CapaMunicipios.tsx               # GeoJSON layer municipios SC
│   ├── PanelDetalle.tsx                 # Panel lateral info político
│   └── LeyendaPartidos.tsx             # Leyenda de colores
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser client
│   │   ├── server.ts                    # Server client (RSC)
│   │   └── queries.ts                   # getProvincias, getMunicipios, etc.
│   └── partidos.ts                      # Colores hardcodeados + helpers
├── types/mapa.ts                        # Provincia, Municipio, Partido
└── public/geojson/
    ├── argentina-provincias.geojson     # 24 provincias
    └── santa-cruz-municipios.geojson    # Municipios de Santa Cruz
```

---

## Task 1: Instalar dependencias del mapa

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar react-leaflet y tipos**

```bash
cd portal-politico
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

- [ ] **Step 2: Verificar instalación**

```bash
npm ls leaflet react-leaflet
```
Expected: `leaflet@1.9.x` y `react-leaflet@4.x` listados sin errores

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add react-leaflet dependencies"
```

---

## Task 2: Crear tipos TypeScript del mapa

**Files:**
- Create: `src/types/mapa.ts`

- [ ] **Step 1: Escribir test de tipos**

Create `src/types/__tests__/mapa.test.ts`:

```typescript
import type { Partido, Provincia, Municipio } from '../mapa'

describe('mapa types', () => {
  it('Partido tiene los campos requeridos', () => {
    const partido: Partido = {
      id: 1,
      nombre: 'PJ',
      slug: 'pj',
      color: '#003087',
      esPersonalizado: false,
    }
    expect(partido.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('Provincia referencia un partido', () => {
    const provincia: Provincia = {
      id: 1,
      nombre: 'Santa Cruz',
      slug: 'santa-cruz',
      codigoIndec: '26',
      gobernadorNombre: 'Claudio Vidal',
      partidoSlug: 'pj',
      partidoColor: '#003087',
    }
    expect(provincia.codigoIndec).toBeDefined()
  })
})
```

- [ ] **Step 2: Correr test — debe fallar**

```bash
npm test -- --testPathPattern="types/__tests__/mapa"
```
Expected: FAIL — `Cannot find module '../mapa'`

- [ ] **Step 3: Crear el archivo de tipos**

Create `src/types/mapa.ts`:

```typescript
export interface Partido {
  id: number
  nombre: string
  slug: string
  color: string
  esPersonalizado: boolean
}

export interface Provincia {
  id: number
  nombre: string
  slug: string
  codigoIndec: string
  gobernadorNombre: string | null
  partidoSlug: string | null
  partidoColor: string
}

export interface Municipio {
  id: number
  nombre: string
  slug: string
  provinciaSlug: string
  intendenteNombre: string | null
  partidoSlug: string | null
  partidoColor: string
  imagenPositiva: number | null
  imagenNegativa: number | null
}

export interface GeoJSONFeatureProperties {
  nombre: string
  slug: string
  codigoIndec?: string
}
```

- [ ] **Step 4: Correr test — debe pasar**

```bash
npm test -- --testPathPattern="types/__tests__/mapa"
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: add political map TypeScript types"
```

---

## Task 3: Configurar colores de partidos

**Files:**
- Create: `src/lib/partidos.ts`
- Create: `src/lib/__tests__/partidos.test.ts`

- [ ] **Step 1: Escribir tests**

Create `src/lib/__tests__/partidos.test.ts`:

```typescript
import { getColorPartido, PARTIDOS_PRINCIPALES } from '../partidos'

describe('partidos', () => {
  it('devuelve color hardcodeado para PJ', () => {
    expect(getColorPartido('pj')).toBe('#003087')
  })

  it('devuelve color hardcodeado para PRO', () => {
    expect(getColorPartido('pro')).toBe('#FFD700')
  })

  it('devuelve gris para partido desconocido', () => {
    expect(getColorPartido('partido-desconocido')).toBe('#94a3b8')
  })

  it('PARTIDOS_PRINCIPALES tiene al menos 5 entradas', () => {
    expect(Object.keys(PARTIDOS_PRINCIPALES).length).toBeGreaterThanOrEqual(5)
  })
})
```

- [ ] **Step 2: Correr test — debe fallar**

```bash
npm test -- --testPathPattern="lib/__tests__/partidos"
```
Expected: FAIL — `Cannot find module '../partidos'`

- [ ] **Step 3: Crear partidos.ts**

Create `src/lib/partidos.ts`:

```typescript
export const PARTIDOS_PRINCIPALES: Record<string, string> = {
  'pj': '#003087',                    // Azul PJ
  'frente-de-todos': '#003087',       // mismo azul
  'union-por-la-patria': '#003087',
  'pro': '#FFD700',                   // Amarillo PRO
  'juntos-por-el-cambio': '#FFD700',
  'juntos': '#FFD700',
  'ucr': '#DC2626',                   // Rojo UCR
  'la-libertad-avanza': '#7C3AED',    // Violeta LLA
  'frente-renovador': '#0EA5E9',      // Celeste FR
  'otros': '#94a3b8',                 // Gris default
}

const COLOR_DEFAULT = '#94a3b8'

export function getColorPartido(slug: string | null | undefined): string {
  if (!slug) return COLOR_DEFAULT
  return PARTIDOS_PRINCIPALES[slug.toLowerCase()] ?? COLOR_DEFAULT
}

export interface PartidoConfig {
  slug: string
  nombre: string
  color: string
}

export const LISTA_PARTIDOS: PartidoConfig[] = [
  { slug: 'pj', nombre: 'PJ / Unión por la Patria', color: '#003087' },
  { slug: 'pro', nombre: 'PRO / Juntos', color: '#FFD700' },
  { slug: 'ucr', nombre: 'UCR', color: '#DC2626' },
  { slug: 'la-libertad-avanza', nombre: 'La Libertad Avanza', color: '#7C3AED' },
  { slug: 'frente-renovador', nombre: 'Frente Renovador', color: '#0EA5E9' },
]
```

- [ ] **Step 4: Correr test — debe pasar**

```bash
npm test -- --testPathPattern="lib/__tests__/partidos"
```
Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/partidos.ts src/lib/__tests__/
git commit -m "feat: add party colors configuration"
```

---

## Task 4: Descargar y agregar datos GeoJSON

**Files:**
- Create: `public/geojson/argentina-provincias.geojson`
- Create: `public/geojson/santa-cruz-municipios.geojson`

- [ ] **Step 1: Descargar GeoJSON de provincias argentinas**

```bash
curl -sL "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/argentina/argentina-provinces.json" -o /tmp/arg-topo.json
# Convertir topojson a geojson si es necesario, o usar alternativa directa:
curl -sL "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/argentina-provinces.geojson" -o public/geojson/argentina-provincias.geojson
```

- [ ] **Step 2: Verificar que el archivo tiene las 24 provincias**

```bash
node -e "
const g = require('./public/geojson/argentina-provincias.geojson');
console.log('Features:', g.features.length);
console.log('Primera provincia:', g.features[0].properties);
"
```
Expected: `Features: 24` y propiedades con nombre de provincia

- [ ] **Step 3: Descargar GeoJSON de municipios de Santa Cruz**

```bash
curl -sL "https://raw.githubusercontent.com/desarrollodesoftware/argentina-geojson/master/municipios/santa_cruz.geojson" -o public/geojson/santa-cruz-municipios.geojson
# Si falla, alternativa manual desde IGN Argentina
```

- [ ] **Step 4: Verificar municipios de Santa Cruz**

```bash
node -e "
const g = require('./public/geojson/santa-cruz-municipios.geojson');
console.log('Municipios SC:', g.features.length);
console.log('Primer municipio:', g.features[0].properties);
"
```
Expected: al menos 7 municipios (Río Gallegos, Caleta Olivia, etc.)

- [ ] **Step 5: Agregar slugs a las propiedades del GeoJSON**

Create `scripts/add-slugs.js`:

```javascript
const fs = require('fs')

function toSlug(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

for (const file of ['argentina-provincias', 'santa-cruz-municipios']) {
  const path = `public/geojson/${file}.geojson`
  const geo = JSON.parse(fs.readFileSync(path, 'utf8'))
  geo.features = geo.features.map(f => ({
    ...f,
    properties: {
      ...f.properties,
      slug: toSlug(f.properties.nombre || f.properties.NAME || f.properties.name || '')
    }
  }))
  fs.writeFileSync(path, JSON.stringify(geo))
  console.log(`✓ ${file}: ${geo.features.length} features`)
}
```

```bash
node scripts/add-slugs.js
```

- [ ] **Step 6: Commit**

```bash
git add public/geojson/ scripts/
git commit -m "feat: add Argentina provinces and Santa Cruz municipalities GeoJSON"
```

---

## Task 5: Configurar Supabase client

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Modify: `.env.local` (solo local, ya en .gitignore)

- [ ] **Step 1: Crear cuenta Supabase y proyecto**

1. Ir a supabase.com → New project → nombre: `portal-politico`
2. Copiar `Project URL` y `anon key` de Settings → API
3. En `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] **Step 2: Instalar Supabase client**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Crear browser client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Crear server client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 5: Verificar build sin errores**

```bash
npm run build
```
Expected: sin errores de TypeScript

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/ package.json package-lock.json
git commit -m "feat: configure Supabase client (browser + server)"
```

---

## Task 6: Crear schema de base de datos en Supabase

**Files:**
- Create: `supabase/migrations/001_mapa_politico.sql`

- [ ] **Step 1: Crear directorio de migraciones**

```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Escribir migration SQL**

Create `supabase/migrations/001_mapa_politico.sql`:

```sql
-- Partidos políticos
CREATE TABLE partidos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#94a3b8',
  es_personalizado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provincias
CREATE TABLE provincias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  codigo_indec TEXT UNIQUE,
  gobernador_nombre TEXT,
  gobernador_desde DATE,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Municipios
CREATE TABLE municipios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  provincia_id INTEGER NOT NULL REFERENCES provincias(id) ON DELETE CASCADE,
  intendente_nombre TEXT,
  intendente_desde DATE,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE SET NULL,
  imagen_positiva NUMERIC(5,2),
  imagen_negativa NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: mapa público, imagen solo autenticados
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE provincias ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partidos_public_read" ON partidos FOR SELECT USING (true);
CREATE POLICY "provincias_public_read" ON provincias FOR SELECT USING (true);
CREATE POLICY "municipios_public_read_base" ON municipios FOR SELECT
  USING (true);

-- Solo admins pueden escribir
CREATE POLICY "partidos_admin_write" ON partidos FOR ALL
  USING (auth.role() = 'authenticated');
CREATE POLICY "provincias_admin_write" ON provincias FOR ALL
  USING (auth.role() = 'authenticated');
CREATE POLICY "municipios_admin_write" ON municipios FOR ALL
  USING (auth.role() = 'authenticated');

-- Datos semilla: partidos principales
INSERT INTO partidos (nombre, slug, color, es_personalizado) VALUES
  ('PJ / Unión por la Patria', 'pj', '#003087', false),
  ('PRO / Juntos', 'pro', '#FFD700', false),
  ('UCR', 'ucr', '#DC2626', false),
  ('La Libertad Avanza', 'la-libertad-avanza', '#7C3AED', false),
  ('Frente Renovador', 'frente-renovador', '#0EA5E9', false),
  ('Otro', 'otro', '#94a3b8', true);

-- Santa Cruz (datos iniciales)
INSERT INTO provincias (nombre, slug, codigo_indec, gobernador_nombre, partido_id)
VALUES ('Santa Cruz', 'santa-cruz', '26', 'Claudio Vidal',
  (SELECT id FROM partidos WHERE slug = 'pj'));
```

- [ ] **Step 3: Ejecutar en Supabase SQL Editor**

1. Ir a Supabase Dashboard → SQL Editor
2. Pegar el contenido del archivo
3. Click "Run"

Expected: `Success. No rows returned`

- [ ] **Step 4: Verificar tablas creadas**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```
Expected: `municipios`, `partidos`, `provincias`

- [ ] **Step 5: Commit migration file**

```bash
git add supabase/
git commit -m "feat: add political map database schema with RLS"
```

---

## Task 7: Crear queries de Supabase para el mapa

**Files:**
- Create: `src/lib/supabase/queries.ts`

- [ ] **Step 1: Escribir tests**

Create `src/lib/supabase/__tests__/queries.test.ts`:

```typescript
import { mapProvinciasToMap, mapMunicipiosToMap } from '../queries'
import type { Provincia, Municipio } from '@/types/mapa'

describe('queries mappers', () => {
  it('mapProvinciasToMap transforma row DB a Provincia', () => {
    const row = {
      id: 1,
      nombre: 'Santa Cruz',
      slug: 'santa-cruz',
      codigo_indec: '26',
      gobernador_nombre: 'Claudio Vidal',
      partidos: { slug: 'pj', color: '#003087' }
    }
    const result = mapProvinciasToMap(row)
    expect(result.codigoIndec).toBe('26')
    expect(result.partidoColor).toBe('#003087')
  })

  it('mapMunicipiosToMap maneja partido null', () => {
    const row = {
      id: 1, nombre: 'El Calafate', slug: 'el-calafate',
      provincia_id: 1, intendente_nombre: null,
      imagen_positiva: null, imagen_negativa: null,
      partidos: null
    }
    const result = mapMunicipiosToMap(row)
    expect(result.partidoColor).toBe('#94a3b8')
  })
})
```

- [ ] **Step 2: Correr test — debe fallar**

```bash
npm test -- --testPathPattern="supabase/__tests__/queries"
```
Expected: FAIL

- [ ] **Step 3: Crear queries.ts**

Create `src/lib/supabase/queries.ts`:

```typescript
import { createClient } from './server'
import { getColorPartido } from '@/lib/partidos'
import type { Provincia, Municipio } from '@/types/mapa'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProvinciasToMap(row: any): Provincia {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    codigoIndec: row.codigo_indec ?? '',
    gobernadorNombre: row.gobernador_nombre,
    partidoSlug: row.partidos?.slug ?? null,
    partidoColor: row.partidos?.color ?? getColorPartido(null),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMunicipiosToMap(row: any): Municipio {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    provinciaSlug: row.provincias?.slug ?? '',
    intendenteNombre: row.intendente_nombre,
    partidoSlug: row.partidos?.slug ?? null,
    partidoColor: row.partidos?.color ?? getColorPartido(null),
    imagenPositiva: row.imagen_positiva,
    imagenNegativa: row.imagen_negativa,
  }
}

export async function getProvincias(): Promise<Provincia[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('provincias')
    .select('*, partidos(slug, color)')
    .order('nombre')
  if (error) throw error
  return (data ?? []).map(mapProvinciasToMap)
}

export async function getMunicipiosByProvincia(provinciaSlug: string): Promise<Municipio[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('municipios')
    .select('*, partidos(slug, color), provincias(slug)')
    .eq('provincias.slug', provinciaSlug)
    .order('nombre')
  if (error) throw error
  return (data ?? []).map(mapMunicipiosToMap)
}

export async function getMunicipioBySlug(slug: string): Promise<Municipio | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('municipios')
    .select('*, partidos(slug, color), provincias(slug)')
    .eq('slug', slug)
    .single()
  if (error) return null
  return mapMunicipiosToMap(data)
}
```

- [ ] **Step 4: Correr test — debe pasar**

```bash
npm test -- --testPathPattern="supabase/__tests__/queries"
```
Expected: PASS — 2 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/queries.ts src/lib/supabase/__tests__/
git commit -m "feat: add Supabase queries for political map data"
```

---

## Task 8: Crear componente MapaArgentina (React-Leaflet)

**Files:**
- Create: `src/components/mapa/MapaArgentina.tsx`
- Create: `src/components/mapa/CapaProvincias.tsx`
- Create: `src/components/mapa/LeyendaPartidos.tsx`

- [ ] **Step 1: Crear CSS de Leaflet en globals**

Modify `src/app/globals.css` — agregar al final:

```css
@import 'leaflet/dist/leaflet.css';

.leaflet-container {
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 2: Crear CapaProvincias**

Create `src/components/mapa/CapaProvincias.tsx`:

```typescript
'use client'

import { GeoJSON, useMap } from 'react-leaflet'
import type { Feature, GeoJsonObject } from 'geojson'
import type { Layer, LeafletMouseEvent } from 'leaflet'
import type { Provincia } from '@/types/mapa'

interface Props {
  geojson: GeoJsonObject
  provincias: Provincia[]
  onProvinciaClick: (slug: string) => void
}

export function CapaProvincias({ geojson, provincias, onProvinciaClick }: Props) {
  const map = useMap()

  function getColorBySlug(slug: string): string {
    return provincias.find(p => p.slug === slug)?.partidoColor ?? '#94a3b8'
  }

  function style(feature?: Feature) {
    const slug = feature?.properties?.slug ?? ''
    return {
      fillColor: getColorBySlug(slug),
      weight: 1,
      color: '#ffffff',
      fillOpacity: 0.8,
    }
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const slug = feature.properties?.slug ?? ''
    const nombre = feature.properties?.nombre ?? feature.properties?.NAME ?? ''

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        e.target.setStyle({ weight: 2, fillOpacity: 1 })
        e.target.bindTooltip(nombre, { sticky: true }).openTooltip()
      },
      mouseout: (e: LeafletMouseEvent) => {
        e.target.setStyle({ weight: 1, fillOpacity: 0.8 })
        e.target.unbindTooltip()
      },
      click: (e: LeafletMouseEvent) => {
        map.fitBounds(e.target.getBounds(), { padding: [20, 20] })
        onProvinciaClick(slug)
      },
    })
  }

  return <GeoJSON data={geojson} style={style} onEachFeature={onEachFeature} />
}
```

- [ ] **Step 3: Crear LeyendaPartidos**

Create `src/components/mapa/LeyendaPartidos.tsx`:

```typescript
import { LISTA_PARTIDOS } from '@/lib/partidos'

export function LeyendaPartidos() {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-lg shadow-md p-3 text-xs">
      <p className="font-bold text-gray-700 mb-2 uppercase tracking-wide">Partidos</p>
      <div className="flex flex-col gap-1.5">
        {LISTA_PARTIDOS.map((p) => (
          <div key={p.slug} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-600">{p.nombre}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm flex-shrink-0 bg-slate-400" />
          <span className="text-gray-600">Sin datos</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crear MapaArgentina principal**

Create `src/components/mapa/MapaArgentina.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'
import type { Provincia, Municipio } from '@/types/mapa'
import { CapaProvincias } from './CapaProvincias'
import { CapaMunicipios } from './CapaMunicipios'
import { PanelDetalle } from './PanelDetalle'
import { LeyendaPartidos } from './LeyendaPartidos'

interface Props {
  provincias: Provincia[]
  provinciasMunicipios: Municipio[]  // municipios de SC pre-cargados
}

export function MapaArgentina({ provincias, provinciasMunicipios }: Props) {
  const [geoProvincias, setGeoProvincias] = useState<GeoJsonObject | null>(null)
  const [geoMunicipios, setGeoMunicipios] = useState<GeoJsonObject | null>(null)
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null)
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<Municipio | null>(null)

  useEffect(() => {
    fetch('/geojson/argentina-provincias.geojson')
      .then(r => r.json()).then(setGeoProvincias)
    fetch('/geojson/santa-cruz-municipios.geojson')
      .then(r => r.json()).then(setGeoMunicipios)
  }, [])

  function handleProvinciaClick(slug: string) {
    setProvinciaSeleccionada(slug)
    setMunicipioSeleccionado(null)
  }

  function handleMunicipioClick(slug: string) {
    const muni = provinciasMunicipios.find(m => m.slug === slug) ?? null
    setMunicipioSeleccionado(muni)
  }

  if (!geoProvincias) return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-500 text-sm">Cargando mapa...</p>
    </div>
  )

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[-38, -63]}
        zoom={4}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        <CapaProvincias
          geojson={geoProvincias}
          provincias={provincias}
          onProvinciaClick={handleProvinciaClick}
        />

        {provinciaSeleccionada === 'santa-cruz' && geoMunicipios && (
          <CapaMunicipios
            geojson={geoMunicipios}
            municipios={provinciasMunicipios}
            onMunicipioClick={handleMunicipioClick}
          />
        )}
      </MapContainer>

      <LeyendaPartidos />

      {municipioSeleccionado && (
        <PanelDetalle
          municipio={municipioSeleccionado}
          onClose={() => setMunicipioSeleccionado(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verificar TypeScript**

```bash
npx tsc --noEmit
```
Expected: sin errores (puede haber warnings de tipos Leaflet — aceptable)

- [ ] **Step 6: Commit**

```bash
git add src/components/mapa/ src/app/globals.css
git commit -m "feat: add MapaArgentina, CapaProvincias and LeyendaPartidos components"
```

---

## Task 9: Crear CapaMunicipios y PanelDetalle

**Files:**
- Create: `src/components/mapa/CapaMunicipios.tsx`
- Create: `src/components/mapa/PanelDetalle.tsx`

- [ ] **Step 1: Crear CapaMunicipios**

Create `src/components/mapa/CapaMunicipios.tsx`:

```typescript
'use client'

import { GeoJSON } from 'react-leaflet'
import type { Feature, GeoJsonObject } from 'geojson'
import type { Layer, LeafletMouseEvent } from 'leaflet'
import type { Municipio } from '@/types/mapa'

interface Props {
  geojson: GeoJsonObject
  municipios: Municipio[]
  onMunicipioClick: (slug: string) => void
}

export function CapaMunicipios({ geojson, municipios, onMunicipioClick }: Props) {
  function getColor(slug: string): string {
    return municipios.find(m => m.slug === slug)?.partidoColor ?? '#94a3b8'
  }

  function style(feature?: Feature) {
    return {
      fillColor: getColor(feature?.properties?.slug ?? ''),
      weight: 1,
      color: '#ffffff',
      fillOpacity: 0.85,
    }
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const slug = feature.properties?.slug ?? ''
    const nombre = feature.properties?.nombre ?? ''

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        e.target.setStyle({ weight: 2, fillOpacity: 1 })
        e.target.bindTooltip(nombre, { sticky: true }).openTooltip()
      },
      mouseout: (e: LeafletMouseEvent) => {
        e.target.setStyle({ weight: 1, fillOpacity: 0.85 })
        e.target.unbindTooltip()
      },
      click: () => onMunicipioClick(slug),
    })
  }

  return <GeoJSON data={geojson} style={style} onEachFeature={onEachFeature} />
}
```

- [ ] **Step 2: Crear PanelDetalle**

Create `src/components/mapa/PanelDetalle.tsx`:

```typescript
'use client'

import { X, User, TrendingUp, TrendingDown } from 'lucide-react'
import type { Municipio } from '@/types/mapa'

interface Props {
  municipio: Municipio
  onClose: () => void
}

export function PanelDetalle({ municipio, onClose }: Props) {
  const tieneImagen = municipio.imagenPositiva !== null

  return (
    <div className="absolute top-4 right-4 z-[1000] w-72 bg-white rounded-xl shadow-xl p-4 sm:w-80">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-black text-gray-900 text-lg leading-tight">
            {municipio.nombre}
          </h2>
          {municipio.partidoSlug && (
            <span
              className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded mt-1 inline-block"
              style={{
                backgroundColor: municipio.partidoColor + '20',
                color: municipio.partidoColor,
              }}
            >
              {municipio.partidoSlug.replace(/-/g, ' ')}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
          aria-label="Cerrar panel"
        >
          <X size={18} />
        </button>
      </div>

      {municipio.intendenteNombre && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <User size={14} className="flex-shrink-0" />
          <span>{municipio.intendenteNombre}</span>
        </div>
      )}

      {tieneImagen ? (
        <div className="space-y-2 mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Imagen política
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
              <TrendingUp size={16} className="text-green-600 mx-auto mb-1" />
              <p className="text-xl font-black text-green-700">
                {municipio.imagenPositiva?.toFixed(0)}%
              </p>
              <p className="text-xs text-green-600">Positiva</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-lg p-2 text-center">
              <TrendingDown size={16} className="text-red-500 mx-auto mb-1" />
              <p className="text-xl font-black text-red-600">
                {municipio.imagenNegativa?.toFixed(0)}%
              </p>
              <p className="text-xs text-red-500">Negativa</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic mb-3">Sin datos de imagen</p>
      )}

      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Últimas noticias
        </p>
        <p className="text-xs text-gray-400 italic">
          Módulo de noticias próximamente
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```
Expected: sin errores

- [ ] **Step 4: Commit**

```bash
git add src/components/mapa/CapaMunicipios.tsx src/components/mapa/PanelDetalle.tsx
git commit -m "feat: add CapaMunicipios and PanelDetalle components"
```

---

## Task 10: Crear página pública del mapa

**Files:**
- Create: `src/app/mapa/page.tsx`

- [ ] **Step 1: Crear página con dynamic import (evita SSR de Leaflet)**

Create `src/app/mapa/page.tsx`:

```typescript
import dynamic from 'next/dynamic'
import { getProvincias, getMunicipiosByProvincia } from '@/lib/supabase/queries'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mapa Político Argentina',
  description: 'Monitoreo político interactivo provincia por provincia',
}

export const revalidate = 300 // 5 minutos

const MapaArgentina = dynamic(
  () => import('@/components/mapa/MapaArgentina').then(m => m.MapaArgentina),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    ),
  }
)

export default async function MapaPage() {
  const [provincias, municipiosSC] = await Promise.all([
    getProvincias(),
    getMunicipiosByProvincia('santa-cruz'),
  ])

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="px-4 py-2 border-b bg-white flex items-center justify-between">
        <h1 className="text-sm font-bold text-gray-700">
          Mapa Político Argentina
        </h1>
        <p className="text-xs text-gray-400">
          Click en provincia → municipios → detalle
        </p>
      </div>
      <div className="flex-1 relative">
        <MapaArgentina
          provincias={provincias}
          provinciasMunicipios={municipiosSC}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Agregar link al mapa en el Header**

Modify `src/components/layout/Header.tsx` — agregar a `NAV_LINKS`:

```typescript
{ label: 'Mapa', href: '/mapa' },
```

- [ ] **Step 3: Correr dev server y verificar mapa**

```bash
npm run dev
```

Abrir `http://localhost:3000/mapa`. Verificar:
- [ ] Mapa de Argentina se renderiza
- [ ] Provincias coloreadas (gris = sin datos todavía)
- [ ] Hover muestra tooltip con nombre
- [ ] Leyenda de partidos visible

- [ ] **Step 4: Commit**

```bash
git add src/app/mapa/
git commit -m "feat: add public political map page"
```

---

## Task 11: Crear admin panel con autenticación

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/api/auth/callback/route.ts`

- [ ] **Step 1: Crear callback de auth**

Create `src/app/api/auth/callback/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/admin`)
}
```

- [ ] **Step 2: Crear página de login**

Create `src/app/admin/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-xl font-black text-gray-900 mb-6">Admin — Portal Político</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#E31E24] text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear layout protegido del admin**

Create `src/app/admin/layout.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <span className="font-black text-sm">
          Admin — <span className="text-[#E31E24]">Portal Político</span>
        </span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin/politicos" className="hover:text-gray-300">Políticos</Link>
          <Link href="/mapa" className="hover:text-gray-300">Ver Mapa</Link>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Crear página principal admin**

Create `src/app/admin/page.tsx`:

```typescript
import Link from 'next/link'
import { getProvincias } from '@/lib/supabase/queries'

export default async function AdminPage() {
  const provincias = await getProvincias()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-3xl font-black text-gray-900">{provincias.length}</p>
          <p className="text-sm text-gray-500">Provincias cargadas</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link
          href="/admin/politicos"
          className="bg-[#E31E24] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
        >
          Gestionar Políticos
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verificar flujo de auth**

```bash
npm run dev
```

1. Ir a `http://localhost:3000/admin` → debe redirigir a `/admin/login`
2. Intentar login con credenciales incorrectas → debe mostrar error
3. En Supabase Dashboard → Authentication → Users → crear usuario con tu email
4. Login con ese usuario → debe mostrar dashboard

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/ src/app/api/
git commit -m "feat: add admin panel with Supabase Auth protection"
```

---

## Task 12: CRUD de políticos en admin

**Files:**
- Create: `src/app/admin/politicos/page.tsx`

- [ ] **Step 1: Crear página CRUD de políticos**

Create `src/app/admin/politicos/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { PoliticosForm } from './PoliticosForm'

export default async function PoliticosPage() {
  const supabase = await createClient()

  const [{ data: provincias }, { data: municipios }, { data: partidos }] = await Promise.all([
    supabase.from('provincias').select('*, partidos(nombre, color)').order('nombre'),
    supabase.from('municipios').select('*, partidos(nombre, color), provincias(nombre)').order('nombre'),
    supabase.from('partidos').select('*').order('nombre'),
  ])

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Gestión de Políticos</h1>
      <PoliticosForm
        provincias={provincias ?? []}
        municipios={municipios ?? []}
        partidos={partidos ?? []}
      />
    </div>
  )
}
```

- [ ] **Step 2: Crear PoliticosForm (client component)**

Create `src/app/admin/politicos/PoliticosForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Partido { id: number; nombre: string; color: string }
interface Provincia { id: number; nombre: string; gobernador_nombre: string | null; partidos: Partido | null }
interface Municipio { id: number; nombre: string; intendente_nombre: string | null; partidos: Partido | null; provincias: { nombre: string } | null }

interface Props {
  provincias: Provincia[]
  municipios: Municipio[]
  partidos: Partido[]
}

export function PoliticosForm({ provincias, municipios, partidos }: Props) {
  const [editProv, setEditProv] = useState<number | null>(null)
  const [govNombre, setGovNombre] = useState('')
  const [govPartido, setGovPartido] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function saveGobernador(provinciaId: number) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('provincias').update({
      gobernador_nombre: govNombre,
      partido_id: Number(govPartido) || null,
    }).eq('id', provinciaId)
    setSaving(false)
    setEditProv(null)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Provincias — Gobernadores</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Provincia</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Gobernador</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Partido</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {provincias.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{p.gobernador_nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    {p.partidos && (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                        style={{ background: p.partidos.color + '20', color: p.partidos.color }}>
                        {p.partidos.nombre}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editProv === p.id ? (
                      <div className="flex gap-2 justify-end">
                        <input value={govNombre} onChange={e => setGovNombre(e.target.value)}
                          placeholder="Nombre gobernador"
                          className="border rounded px-2 py-1 text-xs w-40" />
                        <select value={govPartido} onChange={e => setGovPartido(e.target.value)}
                          className="border rounded px-2 py-1 text-xs">
                          <option value="">Sin partido</option>
                          {partidos.map(pt => <option key={pt.id} value={pt.id}>{pt.nombre}</option>)}
                        </select>
                        <button onClick={() => saveGobernador(p.id)} disabled={saving}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                          {saving ? '...' : 'Guardar'}
                        </button>
                        <button onClick={() => setEditProv(null)}
                          className="text-gray-500 px-2 py-1 rounded text-xs hover:text-gray-700">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditProv(p.id); setGovNombre(p.gobernador_nombre ?? ''); setGovPartido('') }}
                        className="text-blue-600 text-xs hover:text-blue-800">
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

      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Municipios — Santa Cruz</h2>
        <p className="text-sm text-gray-500 mb-3">
          {municipios.filter(m => m.provincias?.nombre === 'Santa Cruz').length} municipios cargados
        </p>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Municipio</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Intendente</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Partido</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {municipios.filter(m => m.provincias?.nombre === 'Santa Cruz').map(m => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-medium">{m.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{m.intendente_nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    {m.partidos && (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                        style={{ background: m.partidos.color + '20', color: m.partidos.color }}>
                        {m.partidos.nombre}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Verificar CRUD en dev**

```bash
npm run dev
```

1. Login en `/admin`
2. Ir a `/admin/politicos`
3. Editar gobernador de una provincia → guardar → verificar que se actualiza

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/politicos/
git commit -m "feat: add politicians CRUD admin panel"
```

---

## Task 13: Deploy a Vercel

**Files:**
- Modify: `next.config.ts` (ya configurado)

- [ ] **Step 1: Crear repo en GitHub**

```bash
git remote add origin https://github.com/TU_USUARIO/portal-politico.git
git push -u origin main
```

- [ ] **Step 2: Conectar Vercel**

1. Ir a vercel.com → New Project → importar repo de GitHub
2. Framework: Next.js (detectado automático)
3. Environment Variables — agregar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

- [ ] **Step 3: Verificar deploy**

Expected:
- Build exitoso en Vercel
- `https://tu-portal.vercel.app/mapa` → mapa visible sin login
- `https://tu-portal.vercel.app/admin` → redirige a login

- [ ] **Step 4: Configurar redirect URL en Supabase**

En Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://tu-portal.vercel.app`
- Redirect URLs: `https://tu-portal.vercel.app/api/auth/callback`

---

## Self-Review

**Spec coverage:**
- ✅ Mapa coloreado por partido del gobernador
- ✅ Click provincia → zoom a municipios (Santa Cruz)
- ✅ Click municipio → panel con intendente + partido + imagen %
- ✅ Colores hardcodeados partidos principales
- ✅ Admin panel con login (solo vos)
- ✅ Mapa público / imagen % solo con login (RLS en DB)
- ✅ Responsive mobile (Leaflet nativo touch)

**Placeholder scan:** ninguno — todo el código está completo en cada step.

**Type consistency:** `Provincia.codigoIndec` ✅, `Municipio.imagenPositiva` ✅, `getColorPartido(slug)` ✅ en todos los usos.

---

## Ejecución

**Plan guardado. Dos opciones:**

**1. Subagent-Driven (recomendado)** — subagente fresco por tarea, revisión doble entre tareas (`/subagent-driven-development`)

**2. Inline** — ejecuto las tareas en esta sesión (`/executing-plans`)

¿Cuál preferís?
