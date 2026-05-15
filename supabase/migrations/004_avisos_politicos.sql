-- Avisos/publicidad política de Facebook Ad Library
CREATE TABLE avisos_politicos (
  id SERIAL PRIMARY KEY,
  politico_id INTEGER NOT NULL REFERENCES politicos(id) ON DELETE CASCADE,
  plataforma TEXT NOT NULL DEFAULT 'facebook',
  aviso_id TEXT,
  texto TEXT,
  nombre_pagina TEXT,
  gasto_min INTEGER,
  gasto_max INTEGER,
  impresiones_min INTEGER,
  impresiones_max INTEGER,
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  url_preview TEXT,
  activo BOOLEAN DEFAULT true,
  analizado_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX avisos_politico_idx ON avisos_politicos(politico_id);
CREATE INDEX avisos_fecha_idx ON avisos_politicos(fecha_inicio DESC);

ALTER TABLE avisos_politicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avisos_auth_read" ON avisos_politicos FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "avisos_auth_write" ON avisos_politicos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
