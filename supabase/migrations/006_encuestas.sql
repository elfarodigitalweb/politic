-- Tabla para datos de encuestas / sondeos políticos
CREATE TABLE encuestas (
  id SERIAL PRIMARY KEY,
  politico_id INTEGER NOT NULL REFERENCES politicos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  intencion_voto DECIMAL(5,2),
  imagen_positiva DECIMAL(5,2),
  imagen_negativa DECIMAL(5,2),
  conocimiento DECIMAL(5,2),
  fuente TEXT NOT NULL DEFAULT '',
  metodologia TEXT,
  universo INTEGER,
  margen_error DECIMAL(4,2),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX encuestas_politico_idx ON encuestas(politico_id);
CREATE INDEX encuestas_fecha_idx ON encuestas(fecha DESC);

ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encuestas_public_read" ON encuestas FOR SELECT USING (true);
CREATE POLICY "encuestas_auth_write" ON encuestas FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
