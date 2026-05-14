# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev       # Servidor de desarrollo en localhost:3000
npm run build     # Build de producción
npm run start     # Servidor de producción
npm run lint      # ESLint
npx prisma migrate dev   # Migrar base de datos
npx prisma studio        # UI para explorar la BD
```

## Stack

- **Next.js 15** (App Router, RSC, ISR) — TypeScript estricto
- **Tailwind CSS v4** para estilos
- **Strapi v5** como CMS headless (REST API en `STRAPI_URL`)
- **PostgreSQL + Prisma** para analytics locales y newsletter
- **Meilisearch** para búsqueda full-text en español

## Arquitectura clave

### Flujo de datos
El contenido vive en Strapi. Next.js lo consume via `src/lib/api/strapi.ts`. Las páginas usan ISR (`revalidate: 30-60`). Cuando Strapi publica un artículo, dispara un webhook a `/api/revalidate` que invalida las rutas afectadas.

### Componentes async vs client
- Los componentes de datos (`FeaturedSection`, `PoliticaSection`) son **async Server Components** — fetch directo, sin `useEffect`.
- Solo los componentes interactivos usan `'use client'`: `Header` (menú mobile), `BreakingNewsTicker` (polling), formularios.

### Breaking news
`useBreakingNews` (hook client) hace polling a `/api/breaking` cada 60 segundos. El ticker animado en el Header muestra los artículos con `isBreaking: true`.

### Revalidación on-demand
`POST /api/revalidate?secret=REVALIDATE_SECRET` — llamado desde webhook de Strapi. Invalida `/`, `/[categoria]`, y `/[categoria]/[slug]` del artículo publicado.

### Tipos
`src/types/index.ts` es la fuente de verdad. El tipo `Province` lista las 24 provincias + CABA. `PoliticalActor` modela gobernadores, legisladores y figuras políticas con su provincia.

## Convenciones

- Color acento: `#E31E24` (rojo)
- Imágenes: siempre `<Image>` de next/image con `fill` + `sizes` adecuado. `priority` solo en hero.
- Rutas de artículos: `/{categoria}/{slug}`
- ISR: `revalidate: 30` en home/categorías, `revalidate: 60` en artículos individuales.
- Skeletons: todo componente async tiene su `*Skeleton` para el `<Suspense>` fallback.
- Variables de entorno: copiar `.env.example` → `.env.local` y completar antes de `npm run dev`.
