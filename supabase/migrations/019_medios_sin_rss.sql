-- Permitir medios sin RSS: agregar columna `dominio` para usar con Google News
-- (site:dominio.com) cuando el medio no expone feed.

ALTER TABLE medios_locales
  ADD COLUMN IF NOT EXISTS dominio TEXT;

-- url_rss ahora es opcional (puede ser NULL si el medio se busca por dominio)
ALTER TABLE medios_locales
  ALTER COLUMN url_rss DROP NOT NULL;

-- Constraint: cada medio tiene que tener al menos uno (url_rss o dominio)
ALTER TABLE medios_locales
  DROP CONSTRAINT IF EXISTS medios_locales_rss_o_dominio;
ALTER TABLE medios_locales
  ADD CONSTRAINT medios_locales_rss_o_dominio
  CHECK (url_rss IS NOT NULL OR dominio IS NOT NULL);

COMMENT ON COLUMN medios_locales.dominio IS
  'Dominio del sitio (ej: opisantacruz.com.ar). Se usa con Google News site: cuando no hay RSS.';
