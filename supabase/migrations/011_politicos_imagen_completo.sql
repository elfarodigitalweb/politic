-- =============================================================
-- POLÍTICOS PARA IMAGEN POLÍTICA — Carga completa
-- Todos los intendentes de Santa Cruz 2023-2027 + Presidente Milei
-- =============================================================

-- Partido La Libertad Avanza
INSERT INTO partidos (nombre, slug, color, es_personalizado)
VALUES ('La Libertad Avanza', 'la-libertad-avanza', '#9B59B6', false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO partidos (nombre, slug, color, es_personalizado)
VALUES ('SER', 'ser', '#1B4FBF', false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO partidos (nombre, slug, color, es_personalizado)
VALUES ('Unión por la Patria', 'union-por-la-patria', '#4A90D9', false)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- PRESIDENTE
-- =============================================================

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Javier Milei',
  'javier-milei',
  'presidente',
  'nacional',
  ARRAY['Javier Milei', 'Milei', 'La Libertad Avanza', 'presidente Milei', 'Casa Rosada'],
  'La Libertad Avanza',
  '#9B59B6',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- GOBERNADOR (verificar que exista)
-- =============================================================

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Claudio Vidal',
  'claudio-vidal',
  'gobernador',
  'santa-cruz',
  ARRAY['Claudio Vidal', 'Vidal gobernador', 'gobernador Santa Cruz', 'SER Santa Cruz'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- INTENDENTES — SER / Por Santa Cruz
-- =============================================================

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Pablo Grasso',
  'pablo-grasso',
  'intendente',
  'santa-cruz',
  ARRAY['Pablo Grasso', 'Grasso', 'intendente Río Gallegos', 'Río Gallegos municipio'],
  'Unión por la Patria',
  '#4A90D9',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Pablo Carrizo',
  'pablo-carrizo',
  'intendente',
  'santa-cruz',
  ARRAY['Pablo Carrizo', 'Carrizo', 'intendente Caleta Olivia', 'Caleta Olivia municipio'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Antonio Carambia',
  'antonio-carambia',
  'intendente',
  'santa-cruz',
  ARRAY['Antonio Carambia', 'Carambia', 'intendente Las Heras', 'Las Heras Santa Cruz'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Pablo Anabalón',
  'pablo-anabalon',
  'intendente',
  'santa-cruz',
  ARRAY['Pablo Anabalón', 'Anabalón', 'intendente Pico Truncado', 'Pico Truncado municipio'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Juan Martínez',
  'juan-martinez-sc',
  'intendente',
  'santa-cruz',
  ARRAY['Juan Martínez', 'intendente Puerto Deseado', 'Puerto Deseado municipio'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Daniel Gardonio',
  'daniel-gardonio',
  'intendente',
  'santa-cruz',
  ARRAY['Daniel Gardonio', 'Gardonio', 'intendente San Julián', 'Puerto San Julián'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Matías Treppo',
  'matias-treppo',
  'intendente',
  'santa-cruz',
  ARRAY['Matías Treppo', 'Treppo', 'intendente Perito Moreno', 'Perito Moreno Santa Cruz'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Zulma Neira',
  'zulma-neira',
  'intendente',
  'santa-cruz',
  ARRAY['Zulma Neira', 'Neira', 'intendente Los Antiguos', 'Los Antiguos Santa Cruz'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Carina Bosso',
  'carina-bosso',
  'intendente',
  'santa-cruz',
  ARRAY['Carina Bosso', 'Bosso', 'intendente Gregores', 'Gobernador Gregores'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Juan Manuel Bórquez',
  'juan-manuel-borquez',
  'intendente',
  'santa-cruz',
  ARRAY['Juan Manuel Bórquez', 'Bórquez', 'intendente Puerto Santa Cruz', 'Puerto Santa Cruz municipio'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Analía Farías',
  'analia-farias',
  'intendente',
  'santa-cruz',
  ARRAY['Analía Farías', 'Farías', 'intendente Piedra Buena', 'Piedra Buena Santa Cruz'],
  'SER',
  '#1B4FBF',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- INTENDENTES — Unión por la Patria
-- =============================================================

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Javier Belloni',
  'javier-belloni',
  'intendente',
  'santa-cruz',
  ARRAY['Javier Belloni', 'Belloni', 'intendente El Calafate', 'El Calafate municipio'],
  'Unión por la Patria',
  '#4A90D9',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Néstor Ticó',
  'nestor-tico',
  'intendente',
  'santa-cruz',
  ARRAY['Néstor Ticó', 'Ticó', 'intendente El Chaltén', 'El Chaltén municipio'],
  'Unión por la Patria',
  '#4A90D9',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Darío Menna',
  'dario-menna',
  'intendente',
  'santa-cruz',
  ARRAY['Darío Menna', 'Menna', 'intendente Río Turbio', 'Río Turbio municipio'],
  'Unión por la Patria',
  '#4A90D9',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Aldo Aravena',
  'aldo-aravena',
  'intendente',
  'santa-cruz',
  ARRAY['Aldo Aravena', 'Aravena', 'intendente 28 de Noviembre', '28 de Noviembre municipio'],
  'Unión por la Patria',
  '#4A90D9',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO politicos (nombre, slug, cargo, provincia_slug, palabras_clave, partido_nombre, partido_color, activo, en_testeo)
VALUES (
  'Nayla Fernández',
  'nayla-fernandez',
  'otro',
  'santa-cruz',
  ARRAY['Nayla Fernández', 'Fernández', 'Tres Lagos', 'comisionada Tres Lagos'],
  'Unión por la Patria',
  '#4A90D9',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- ENCUESTAS — Milei (Atlas Intel, mayo 2026)
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 35.5, 63.0,
  'Atlas Intel',
  'Encuesta nacional',
  'Aprobación gestión 35.5% / Desaprobación 63%. Fuente: Infobae / Atlas Intel, mayo 2026.'
FROM politicos WHERE slug = 'javier-milei';

-- Imagen histórica de Milei para el gráfico de tendencia
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.0, 40.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.2, 45.0, 0, '2024-07-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 45.8, 50.5, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 42.1, 55.2, 0, '2025-01-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 38.9, 58.3, 0, '2025-06-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 37.2, 60.1, 0, '2026-01-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.5, 63.0, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';
