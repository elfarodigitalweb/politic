-- Políticos a monitorear
CREATE TABLE politicos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cargo TEXT NOT NULL,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE SET NULL,
  provincia_slug TEXT NOT NULL DEFAULT 'santa-cruz',
  foto_url TEXT,
  palabras_clave TEXT[] NOT NULL DEFAULT '{}',
  facebook_page_id TEXT,
  instagram_username TEXT,
  en_testeo BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menciones individuales analizadas
CREATE TABLE menciones (
  id SERIAL PRIMARY KEY,
  politico_id INTEGER NOT NULL REFERENCES politicos(id) ON DELETE CASCADE,
  fuente TEXT NOT NULL,
  url TEXT,
  titulo TEXT NOT NULL,
  sentimiento TEXT NOT NULL CHECK (sentimiento IN ('positivo', 'negativo', 'neutral')),
  score NUMERIC(4,3) NOT NULL DEFAULT 0,
  publicado_at TIMESTAMPTZ NOT NULL,
  analizado_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snapshots históricos de imagen (calculados cada 6h)
CREATE TABLE imagen_historico (
  id SERIAL PRIMARY KEY,
  politico_id INTEGER NOT NULL REFERENCES politicos(id) ON DELETE CASCADE,
  imagen_positiva NUMERIC(5,2) NOT NULL,
  imagen_negativa NUMERIC(5,2) NOT NULL,
  total_menciones INTEGER NOT NULL DEFAULT 0,
  calculado_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX menciones_politico_idx ON menciones(politico_id);
CREATE INDEX menciones_publicado_idx ON menciones(publicado_at DESC);
CREATE INDEX imagen_historico_politico_idx ON imagen_historico(politico_id);
CREATE INDEX imagen_historico_calculado_idx ON imagen_historico(calculado_at DESC);

-- RLS
ALTER TABLE politicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE menciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagen_historico ENABLE ROW LEVEL SECURITY;

-- Políticos: lectura pública (excepto en_testeo)
CREATE POLICY "politicos_public_read" ON politicos FOR SELECT
  USING (activo = true AND (en_testeo = false OR auth.role() = 'authenticated'));

-- Menciones: solo autenticados
CREATE POLICY "menciones_auth_read" ON menciones FOR SELECT
  USING (auth.role() = 'authenticated');

-- Historial: solo autenticados
CREATE POLICY "imagen_historico_auth_read" ON imagen_historico FOR SELECT
  USING (auth.role() = 'authenticated');

-- Escritura: solo autenticados
CREATE POLICY "politicos_auth_write" ON politicos FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "menciones_auth_write" ON menciones FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "imagen_historico_auth_write" ON imagen_historico FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Datos semilla: políticos de Santa Cruz
INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, en_testeo) VALUES
  ('Claudio Vidal', 'claudio-vidal', 'gobernador', 'santa-cruz',
    ARRAY['Claudio Vidal', 'gobernador Santa Cruz', 'Vidal Santa Cruz'], false),
  ('Pablo Grasso', 'pablo-grasso', 'intendente', 'santa-cruz',
    ARRAY['Pablo Grasso', 'intendente Río Gallegos', 'Grasso Rio Gallegos'], false);
