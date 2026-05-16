-- Tabla de problemáticas detectadas automáticamente por localidad en Santa Cruz
CREATE TABLE problematicas_sc (
  id SERIAL PRIMARY KEY,
  localidad_slug TEXT NOT NULL,
  localidad_nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  fuente_nombre TEXT,
  url TEXT,
  severidad INTEGER DEFAULT 2 CHECK (severidad IN (1, 2, 3)),
  publicado_at TIMESTAMPTZ NOT NULL,
  detectado_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX prob_localidad_idx ON problematicas_sc(localidad_slug);
CREATE INDEX prob_fecha_idx ON problematicas_sc(publicado_at DESC);
CREATE INDEX prob_cat_idx ON problematicas_sc(categoria);
CREATE INDEX prob_sev_idx ON problematicas_sc(severidad DESC);

ALTER TABLE problematicas_sc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prob_public_read" ON problematicas_sc FOR SELECT USING (true);
CREATE POLICY "prob_auth_write" ON problematicas_sc FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
