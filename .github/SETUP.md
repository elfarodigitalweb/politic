# Setup de GitHub Actions

## Secrets requeridos

Ir a: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

| Secret | Valor |
|---|---|
| `ANALIZAR_SECRET` | El valor de `ANALIZAR_SECRET` en tu `.env` |
| `APP_URL` | URL de Vercel (ej: `https://tu-portal.vercel.app`) |

## Variables de entorno en Vercel

Asegurate de agregar en Vercel → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANALIZAR_SECRET`
- `HUGGINGFACE_API_TOKEN` (opcional — obtenerlo gratis en huggingface.co)

## Trigger manual

El workflow se puede ejecutar manualmente desde:
GitHub repo → Actions → "Analizar imagen política" → Run workflow
