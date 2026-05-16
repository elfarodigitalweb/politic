-- =============================================================
-- FIX INTEGRAL: columnas faltantes + seed completo de políticos
-- Ejecutar si la tabla politicos aparece vacía en el admin
-- =============================================================

-- Asegurar columnas que pueden faltar
ALTER TABLE politicos ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE politicos ADD COLUMN IF NOT EXISTS instagram_username TEXT;
ALTER TABLE politicos ADD COLUMN IF NOT EXISTS facebook_page_id TEXT;
ALTER TABLE politicos ADD COLUMN IF NOT EXISTS partido_color TEXT DEFAULT '#94a3b8';
ALTER TABLE politicos ADD COLUMN IF NOT EXISTS partido_nombre TEXT;
ALTER TABLE politicos ADD COLUMN IF NOT EXISTS en_testeo BOOLEAN DEFAULT false;
ALTER TABLE politicos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Partidos base
INSERT INTO partidos (nombre, slug, color, es_personalizado) VALUES
  ('SER', 'ser', '#1B4FBF', false),
  ('Unión por la Patria', 'union-por-la-patria', '#4A90D9', false),
  ('La Libertad Avanza', 'la-libertad-avanza', '#9B59B6', false)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- SEED COMPLETO — todos los políticos para imagen
-- =============================================================

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES
  -- Presidente
  ('Javier Milei', 'javier-milei', 'presidente', 'nacional',
   ARRAY['Javier Milei', 'Milei', 'La Libertad Avanza', 'presidente Milei'],
   'La Libertad Avanza', '#9B59B6', true, false),

  -- Gobernador
  ('Claudio Vidal', 'claudio-vidal', 'gobernador', 'santa-cruz',
   ARRAY['Claudio Vidal', 'Vidal gobernador', 'gobernador Santa Cruz', 'SER Santa Cruz'],
   'SER', '#1B4FBF', true, false),

  -- Intendentes UxP
  ('Pablo Grasso', 'pablo-grasso', 'intendente', 'santa-cruz',
   ARRAY['Pablo Grasso', 'Grasso', 'intendente Río Gallegos'],
   'Unión por la Patria', '#4A90D9', true, false),

  ('Javier Belloni', 'javier-belloni', 'intendente', 'santa-cruz',
   ARRAY['Javier Belloni', 'Belloni', 'El Calafate intendente'],
   'Unión por la Patria', '#4A90D9', true, false),

  ('Néstor Ticó', 'nestor-tico', 'intendente', 'santa-cruz',
   ARRAY['Néstor Ticó', 'Ticó', 'El Chaltén intendente'],
   'Unión por la Patria', '#4A90D9', true, false),

  ('Darío Menna', 'dario-menna', 'intendente', 'santa-cruz',
   ARRAY['Darío Menna', 'Menna', 'Río Turbio intendente'],
   'Unión por la Patria', '#4A90D9', true, false),

  ('Aldo Aravena', 'aldo-aravena', 'intendente', 'santa-cruz',
   ARRAY['Aldo Aravena', 'Aravena', '28 de Noviembre intendente'],
   'Unión por la Patria', '#4A90D9', true, false),

  ('Nayla Fernández', 'nayla-fernandez', 'otro', 'santa-cruz',
   ARRAY['Nayla Fernández', 'Fernández', 'Tres Lagos comisionada'],
   'Unión por la Patria', '#4A90D9', true, false),

  -- Intendentes SER
  ('Pablo Carrizo', 'pablo-carrizo', 'intendente', 'santa-cruz',
   ARRAY['Pablo Carrizo', 'Carrizo', 'Caleta Olivia intendente'],
   'SER', '#1B4FBF', true, false),

  ('Antonio Carambia', 'antonio-carambia', 'intendente', 'santa-cruz',
   ARRAY['Antonio Carambia', 'Carambia', 'Las Heras intendente'],
   'SER', '#1B4FBF', true, false),

  ('Pablo Anabalón', 'pablo-anabalon', 'intendente', 'santa-cruz',
   ARRAY['Pablo Anabalón', 'Anabalón', 'Pico Truncado intendente'],
   'SER', '#1B4FBF', true, false),

  ('Juan Martínez', 'juan-martinez-sc', 'intendente', 'santa-cruz',
   ARRAY['Juan Martínez', 'Puerto Deseado intendente'],
   'SER', '#1B4FBF', true, false),

  ('Daniel Gardonio', 'daniel-gardonio', 'intendente', 'santa-cruz',
   ARRAY['Daniel Gardonio', 'Gardonio', 'San Julián intendente'],
   'SER', '#1B4FBF', true, false),

  ('Matías Treppo', 'matias-treppo', 'intendente', 'santa-cruz',
   ARRAY['Matías Treppo', 'Treppo', 'Perito Moreno intendente'],
   'SER', '#1B4FBF', true, false),

  ('Zulma Neira', 'zulma-neira', 'intendente', 'santa-cruz',
   ARRAY['Zulma Neira', 'Neira', 'Los Antiguos intendente'],
   'SER', '#1B4FBF', true, false),

  ('Carina Bosso', 'carina-bosso', 'intendente', 'santa-cruz',
   ARRAY['Carina Bosso', 'Bosso', 'Gregores intendente'],
   'SER', '#1B4FBF', true, false),

  ('Juan Manuel Bórquez', 'juan-manuel-borquez', 'intendente', 'santa-cruz',
   ARRAY['Juan Manuel Bórquez', 'Bórquez', 'Puerto Santa Cruz intendente'],
   'SER', '#1B4FBF', true, false),

  ('Analía Farías', 'analia-farias', 'intendente', 'santa-cruz',
   ARRAY['Analía Farías', 'Farías', 'Piedra Buena intendente'],
   'SER', '#1B4FBF', true, false)

ON CONFLICT (slug) DO UPDATE SET
  nombre          = EXCLUDED.nombre,
  cargo           = EXCLUDED.cargo,
  provincia_slug  = EXCLUDED.provincia_slug,
  palabras_clave  = EXCLUDED.palabras_clave,
  partido_nombre  = EXCLUDED.partido_nombre,
  partido_color   = EXCLUDED.partido_color,
  activo          = EXCLUDED.activo;

-- Verificar resultado
SELECT nombre, cargo, provincia_slug, activo FROM politicos ORDER BY nombre;
