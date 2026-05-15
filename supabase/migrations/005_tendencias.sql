CREATE TABLE tendencias (
  id SERIAL PRIMARY KEY,
  politico_id INTEGER NOT NULL REFERENCES politicos(id) ON DELETE CASCADE,
  plataforma TEXT NOT NULL,
  valor NUMERIC(5,2) NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  calculado_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX tendencias_politico_idx ON tendencias(politico_id);
CREATE INDEX tendencias_calculado_idx ON tendencias(calculado_at DESC);

ALTER TABLE tendencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tendencias_auth_read" ON tendencias FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "tendencias_auth_write" ON tendencias FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
