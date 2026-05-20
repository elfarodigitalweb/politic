-- Generalizar problematicas_sc para soportar TODAS las provincias.
-- Mantenemos el nombre de la tabla por compatibilidad pero ahora cada fila
-- lleva su provincia_slug.

ALTER TABLE problematicas_sc
  ADD COLUMN IF NOT EXISTS provincia_slug TEXT NOT NULL DEFAULT 'santa-cruz';

-- Índice para queries por provincia (típicas en el tablero)
CREATE INDEX IF NOT EXISTS idx_problematicas_provincia
  ON problematicas_sc (provincia_slug, publicado_at DESC);

COMMENT ON COLUMN problematicas_sc.provincia_slug IS
  'Slug de la provincia (ej: santa-cruz, cordoba). Permite escanear alertas para cualquier provincia.';
