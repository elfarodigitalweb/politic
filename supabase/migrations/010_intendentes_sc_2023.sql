-- =============================================================
-- INTENDENTES SANTA CRUZ — Período 2023-2027
-- Fuente: Gobierno de Santa Cruz / La Opinión Austral / OPI SC
-- Proclamación oficial: 30 de noviembre 2023
-- =============================================================

-- ---------------------------------------------------------------
-- PARTIDOS: asegurar que existan SER y Unión por la Patria
-- ---------------------------------------------------------------

INSERT INTO partidos (nombre, slug, color, es_personalizado)
VALUES ('SER', 'ser', '#1B4FBF', false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO partidos (nombre, slug, color, es_personalizado)
VALUES ('Unión por la Patria', 'union-por-la-patria', '#4A90D9', false)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------
-- MUNICIPIOS: actualizar intendentes
-- Bloque SER / Por Santa Cruz (10 municipios)
-- ---------------------------------------------------------------

UPDATE municipios SET
  intendente_nombre = 'Pablo Carrizo',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'caleta-olivia';

UPDATE municipios SET
  intendente_nombre = 'Antonio Carambia',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'las-heras-sc';

UPDATE municipios SET
  intendente_nombre = 'Pablo Anabalón',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'pico-truncado';

UPDATE municipios SET
  intendente_nombre = 'Juan Martínez',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'puerto-deseado';

UPDATE municipios SET
  intendente_nombre = 'Daniel Gardonio',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'puerto-san-julian';

UPDATE municipios SET
  intendente_nombre = 'Matías Treppo',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'perito-moreno-sc';

UPDATE municipios SET
  intendente_nombre = 'Zulma Neira',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'los-antiguos';

UPDATE municipios SET
  intendente_nombre = 'Carina Bosso',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'gobernador-gregores';

UPDATE municipios SET
  intendente_nombre = 'Juan Manuel Bórquez',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'puerto-santa-cruz';

UPDATE municipios SET
  intendente_nombre = 'Analía Farías',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'piedra-buena';

-- ---------------------------------------------------------------
-- Bloque Unión por la Patria (5 municipios)
-- ---------------------------------------------------------------

UPDATE municipios SET
  intendente_nombre = 'Pablo Grasso',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'rio-gallegos';

UPDATE municipios SET
  intendente_nombre = 'Javier Belloni',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'el-calafate';

UPDATE municipios SET
  intendente_nombre = 'Néstor Ticó',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'el-chalten';

UPDATE municipios SET
  intendente_nombre = 'Darío Menna',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'rio-turbio';

UPDATE municipios SET
  intendente_nombre = 'Aldo Aravena',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = '28-de-noviembre';

-- Tres Lagos — Comisión de Fomento (no es municipio formal)
UPDATE municipios SET
  intendente_nombre = 'Nayla Fernández (Com. Fomento)',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'tres-lagos';

-- ---------------------------------------------------------------
-- POLITICOS DE IMAGEN: también agregar Grasso con slug correcto
-- (verificar que exista, si no insertar)
-- ---------------------------------------------------------------

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
SELECT
  'Pablo Grasso',
  'pablo-grasso',
  'intendente',
  'santa-cruz',
  ARRAY['Pablo Grasso', 'Grasso', 'intendente Río Gallegos', 'Río Gallegos'],
  'Unión por la Patria',
  '#4A90D9',
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM politicos WHERE slug = 'pablo-grasso');

-- ---------------------------------------------------------------
-- Resumen de los 15 intendentes 2023-2027
-- SER (Por Santa Cruz): 10 municipios
--   Caleta Olivia, Las Heras, Pico Truncado, Puerto Deseado,
--   Puerto San Julián, Perito Moreno, Los Antiguos,
--   Gobernador Gregores, Puerto Santa Cruz, Piedra Buena
-- Unión por la Patria: 5 municipios + 1 comisión
--   Río Gallegos, El Calafate, El Chaltén, Río Turbio,
--   28 de Noviembre, Tres Lagos (CF)
-- Vicegobernador: Fabián Leguizamón (SER)
-- ---------------------------------------------------------------
