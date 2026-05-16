-- Tabla para guardar los clippings generados por IA
CREATE TABLE IF NOT EXISTS clippings (
  id SERIAL PRIMARY KEY,
  contenido TEXT NOT NULL,
  modelo TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  tokens_usados INTEGER,
  generado_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clippings_fecha_idx ON clippings(generado_at DESC);

ALTER TABLE clippings ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden leer y escribir
CREATE POLICY "clippings_auth_read" ON clippings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "clippings_auth_write" ON clippings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
