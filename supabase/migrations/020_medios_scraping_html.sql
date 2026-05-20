-- Soporte para medios mal indexados en Google News y sin RSS:
-- scraping HTML directo de una URL (típicamente la home del medio).
-- Tercera modalidad de fuente, después de url_rss y dominio.

ALTER TABLE medios_locales
  ADD COLUMN IF NOT EXISTS url_scraping TEXT;

-- Reemplazar el constraint para aceptar las 3 modalidades
ALTER TABLE medios_locales
  DROP CONSTRAINT IF EXISTS medios_locales_rss_o_dominio;
ALTER TABLE medios_locales
  ADD CONSTRAINT medios_locales_fuente_requerida
  CHECK (
    url_rss IS NOT NULL
    OR dominio IS NOT NULL
    OR url_scraping IS NOT NULL
  );

COMMENT ON COLUMN medios_locales.url_scraping IS
  'URL completa (típicamente la home) para hacer scraping HTML cuando el medio no tiene RSS y Google News lo indexa pobremente.';
