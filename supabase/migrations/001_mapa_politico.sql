-- Partidos políticos
CREATE TABLE partidos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#94a3b8',
  es_personalizado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provincias
CREATE TABLE provincias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  codigo_indec TEXT UNIQUE,
  gobernador_nombre TEXT,
  gobernador_desde DATE,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Municipios / Departamentos
CREATE TABLE municipios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  provincia_id INTEGER NOT NULL REFERENCES provincias(id) ON DELETE CASCADE,
  intendente_nombre TEXT,
  intendente_desde DATE,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE SET NULL,
  imagen_positiva NUMERIC(5,2),
  imagen_negativa NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: lectura pública para todos
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE provincias ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partidos_public_read" ON partidos FOR SELECT USING (true);
CREATE POLICY "provincias_public_read" ON provincias FOR SELECT USING (true);
CREATE POLICY "municipios_public_read" ON municipios FOR SELECT USING (true);

-- Solo usuarios autenticados pueden escribir
CREATE POLICY "partidos_auth_write" ON partidos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "provincias_auth_write" ON provincias FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "municipios_auth_write" ON municipios FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Datos semilla: partidos principales
INSERT INTO partidos (nombre, slug, color, es_personalizado) VALUES
  ('PJ / Unión por la Patria', 'pj', '#003087', false),
  ('PRO / Juntos', 'pro', '#FFD700', false),
  ('UCR', 'ucr', '#DC2626', false),
  ('La Libertad Avanza', 'la-libertad-avanza', '#7C3AED', false),
  ('Frente Renovador', 'frente-renovador', '#0EA5E9', false),
  ('Otro', 'otro', '#94a3b8', true);

-- Santa Cruz con gobernador actual
INSERT INTO provincias (nombre, slug, codigo_indec, gobernador_nombre, partido_id)
VALUES (
  'Santa Cruz',
  'santa-cruz',
  '26',
  'Claudio Vidal',
  (SELECT id FROM partidos WHERE slug = 'pj')
);

-- Los 7 departamentos de Santa Cruz del GeoJSON
INSERT INTO municipios (nombre, slug, provincia_id, intendente_nombre, partido_id) VALUES
  ('Lago Argentino', 'lago-argentino',
    (SELECT id FROM provincias WHERE slug = 'santa-cruz'), NULL, NULL),
  ('Lago Buenos Aires', 'lago-buenos-aires',
    (SELECT id FROM provincias WHERE slug = 'santa-cruz'), NULL, NULL),
  ('Corpen Aike', 'corpen-aike',
    (SELECT id FROM provincias WHERE slug = 'santa-cruz'), NULL, NULL),
  ('Deseado', 'deseado',
    (SELECT id FROM provincias WHERE slug = 'santa-cruz'), NULL, NULL),
  ('Güer Aike', 'guer-aike',
    (SELECT id FROM provincias WHERE slug = 'santa-cruz'), NULL, NULL),
  ('Magallanes', 'magallanes',
    (SELECT id FROM provincias WHERE slug = 'santa-cruz'), NULL, NULL),
  ('Río Chico', 'rio-chico',
    (SELECT id FROM provincias WHERE slug = 'santa-cruz'), NULL, NULL);
