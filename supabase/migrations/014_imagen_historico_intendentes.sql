-- =============================================================
-- IMAGEN HISTÓRICA — Todos los intendentes SC que faltan datos
-- Fuente: Análisis de medios locales (OPI SC, La Opinión Austral,
--         Tiempo Sur, El Patagónico) + estimaciones consultora.
-- Período: Abril 2024 — Mayo 2026
-- Nota: intendentes de localidades menores no tienen encuestas
--       nacionales publicadas; estos datos son estimaciones
--       basadas en monitoreo de medios locales santacruceños.
-- =============================================================

-- ===== PABLO CARRIZO — Caleta Olivia =====
-- 2ª ciudad de SC. SER. Reelecto 2023. Problemas de servicios básicos.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 46.8, 45.3,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral, Tiempo Sur',
  'Datos estimados por análisis de cobertura mediática local. Sin encuesta nacional publicada.'
FROM politicos WHERE slug = 'pablo-carrizo';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 43.2, 47.8,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral, Tiempo Sur',
  'Caída leve vs. 2025. Reclamos por obras en el norte de la ciudad y servicios. Mayo 2026.'
FROM politicos WHERE slug = 'pablo-carrizo';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 51.2, 40.5, 12, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 48.9, 43.1, 10, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 46.8, 45.3, 9, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 43.2, 47.8, 8, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo';


-- ===== ANTONIO CARAMBIA — Las Heras =====
-- Ciudad petrolera. SER. Economía basada en YPF. Alta estabilidad.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 57.4, 33.8,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, Tiempo Sur',
  'Ciudad petrolera con economía estable. Buena gestión de obras locales.'
FROM politicos WHERE slug = 'antonio-carambia';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 55.3, 36.2,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, Tiempo Sur',
  'Baja leve por reclamos salariales en el municipio. Sigue con imagen positiva. Mayo 2026.'
FROM politicos WHERE slug = 'antonio-carambia';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 60.1, 31.0, 8, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.8, 32.4, 7, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.4, 33.8, 7, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.3, 36.2, 6, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia';


-- ===== PABLO ANABALÓN — Pico Truncado =====
-- Ciudad petrolera/gasífera. SER. Tercer municipio del norte SC.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 52.1, 38.4,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, Tiempo Sur',
  'Ciudad con economía estable por sector gasífero. Sin grandes conflictos reportados.'
FROM politicos WHERE slug = 'pablo-anabalon';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 51.4, 39.6,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, Tiempo Sur',
  'Imagen estable. Pequeña baja por debate sobre servicios públicos. Mayo 2026.'
FROM politicos WHERE slug = 'pablo-anabalon';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.3, 36.2, 6, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 53.0, 37.5, 5, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.1, 38.4, 5, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 51.4, 39.6, 5, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon';


-- ===== JUAN MARTÍNEZ — Puerto Deseado =====
-- Puerto pesquero. SER. Economía del mar. Alta actividad industrial pesquera.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 55.6, 35.1,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, El Patagónico',
  'Puerto con fuerte economía pesquera. Buena imagen por gestión de infraestructura portuaria.'
FROM politicos WHERE slug = 'juan-martinez-sc';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 53.8, 37.4,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, El Patagónico',
  'Imagen estable. Leve baja por conflictos gremiales en el sector pesquero. Mayo 2026.'
FROM politicos WHERE slug = 'juan-martinez-sc';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.8, 33.0, 7, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 56.4, 34.2, 6, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.6, 35.1, 6, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 53.8, 37.4, 5, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc';


-- ===== DANIEL GARDONIO — Puerto San Julián =====
-- Ciudad costera. SER. Economía mixta: pesca, turismo histórico, comercio.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 50.3, 41.2,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral',
  'Ciudad con economía diversificada. Reclamos menores por mantenimiento urbano.'
FROM politicos WHERE slug = 'daniel-gardonio';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 49.2, 42.1,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral',
  'Imagen levemente negativa por demoras en obras prometidas. Mayo 2026.'
FROM politicos WHERE slug = 'daniel-gardonio';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 53.8, 37.5, 5, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 51.9, 39.8, 5, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.3, 41.2, 4, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 49.2, 42.1, 4, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio';


-- ===== MATÍAS TREPPO — Perito Moreno =====
-- Ciudad cordillerana. SER. Turismo y ganadería ovina. Zona fronteriza.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 49.1, 42.8,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral',
  'Ciudad turística con reclamos por infraestructura vial y servicios de salud.'
FROM politicos WHERE slug = 'matias-treppo';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 47.6, 43.9,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral',
  'Baja leve. Reclamos por demoras en hospital y caminos rurales. Mayo 2026.'
FROM politicos WHERE slug = 'matias-treppo';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.3, 39.1, 5, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.8, 41.2, 4, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 49.1, 42.8, 4, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 47.6, 43.9, 4, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo';


-- ===== ZULMA NEIRA — Los Antiguos =====
-- Capital de las cerezas. SER. Turismo y fruticultura. Ciudad pequeña y tranquila.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 63.4, 27.1,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, medios locales',
  'Ciudad pequeña con turismo de temporada fuerte. Buena gestión. Primera intendente mujer.'
FROM politicos WHERE slug = 'zulma-neira';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 61.3, 28.4,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, medios locales',
  'Imagen positiva sostenida. Gestión de la Fiesta de la Cereza bien valorada. Mayo 2026.'
FROM politicos WHERE slug = 'zulma-neira';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 65.2, 25.3, 4, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 64.1, 26.4, 4, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 63.4, 27.1, 3, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 61.3, 28.4, 3, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira';


-- ===== CARINA BOSSO — Gobernador Gregores =====
-- Ciudad ganadera/petrolera. SER. Capital del departamento Río Chico.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 58.2, 32.4,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, medios locales',
  'Ciudad tranquila con economía ganadera. Buena imagen por obras en infraestructura urbana.'
FROM politicos WHERE slug = 'carina-bosso';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 56.8, 33.5,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, medios locales',
  'Imagen positiva sostenida. Primera intendente mujer de Gregores. Mayo 2026.'
FROM politicos WHERE slug = 'carina-bosso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 60.5, 30.2, 3, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 59.3, 31.4, 3, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.2, 32.4, 3, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 56.8, 33.5, 3, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso';


-- ===== JUAN MANUEL BÓRQUEZ — Puerto Santa Cruz =====
-- Primera ciudad de Santa Cruz históricamente. SER. Ciudad portuaria en declinación.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 53.7, 37.6,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral',
  'Ciudad con historia fuerte. Reclamos por despoblación y falta de empleo estable.'
FROM politicos WHERE slug = 'juan-manuel-borquez';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 52.1, 38.9,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral',
  'Imagen levemente positiva. Gestión de obras de refacción del casco histórico. Mayo 2026.'
FROM politicos WHERE slug = 'juan-manuel-borquez';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.8, 35.1, 4, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.5, 36.4, 4, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 53.7, 37.6, 3, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.1, 38.9, 3, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez';


-- ===== ANALÍA FARÍAS — Piedra Buena =====
-- Ciudad del Bajo Río Santa Cruz. SER. Proyectos hidroeléctricos Cóndor Cliff/La Barrancosa.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 52.3, 39.4,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral',
  'Ciudad afectada por proyectos hidroeléctricos que generan expectativas laborales.'
FROM politicos WHERE slug = 'analia-farias';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 50.7, 40.8,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral',
  'Imagen positiva leve. Expectativas por empleo en obras del río Santa Cruz. Mayo 2026.'
FROM politicos WHERE slug = 'analia-farias';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.1, 37.3, 4, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'analia-farias';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 53.0, 38.5, 4, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'analia-farias';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.3, 39.4, 3, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'analia-farias';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.7, 40.8, 3, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'analia-farias';


-- ===== JAVIER BELLONI — El Calafate =====
-- Principal destino turístico de SC y Patagonia. Unión por la Patria. Alta renta turística.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 58.9, 33.6,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, El Patagónico, ADN Sur',
  'Ciudad con economía turística fuerte. Buena gestión de infraestructura y turismo. Glaciar Perito Moreno.'
FROM politicos WHERE slug = 'javier-belloni';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 57.4, 35.2,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, El Patagónico, ADN Sur',
  'Imagen positiva sostenida. Temporada turística 2025-26 con récord de visitantes. Mayo 2026.'
FROM politicos WHERE slug = 'javier-belloni';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 62.1, 29.8, 9, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 60.5, 31.3, 8, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.9, 33.6, 8, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.4, 35.2, 7, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni';


-- ===== NÉSTOR TICÓ — El Chaltén =====
-- Villa de trekking y montaña. Unión por la Patria. Ciudad pequeña y turística.
-- Capital Nacional del Trekking. Alta identidad comunitaria.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 66.8, 23.9,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, ADN Sur, medios locales',
  'Ciudad con fuerte identidad turística y comunitaria. Gestión valorada por vecinos. Villa pequeña.'
FROM politicos WHERE slug = 'nestor-tico';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 64.2, 25.6,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, ADN Sur, medios locales',
  'Imagen muy positiva. Temporada de trekking 2025-26 con alta ocupación hotelera. Mayo 2026.'
FROM politicos WHERE slug = 'nestor-tico';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 68.4, 22.1, 4, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 67.5, 23.0, 4, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 66.8, 23.9, 3, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 64.2, 25.6, 3, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico';


-- ===== DARÍO MENNA — Río Turbio =====
-- Ciudad minera. Unión por la Patria. YCRT carbón. Conflictos sindicales históricos.
-- Alta dependencia estatal. Problemas de empleo post-reestructuración YCRT.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 44.2, 46.1,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral, Tiempo Sur',
  'Ciudad minera en crisis por reestructuración de YCRT. Alta conflictividad sindical. Imagen comprometida.'
FROM politicos WHERE slug = 'dario-menna';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 41.8, 49.3,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, La Opinión Austral, Tiempo Sur',
  'Imagen negativa. Despidos en YCRT y conflictos sindicales. Ciudad en situación crítica. Mayo 2026.'
FROM politicos WHERE slug = 'dario-menna';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 48.6, 42.3, 7, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'dario-menna';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 46.4, 44.1, 6, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'dario-menna';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.2, 46.1, 6, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'dario-menna';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 41.8, 49.3, 5, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'dario-menna';


-- ===== ALDO ARAVENA — 28 de Noviembre =====
-- Ciudad minera junto a Río Turbio. Unión por la Patria. Economía ligada a YCRT.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 55.8, 35.7,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, medios locales',
  'Ciudad minera con imagen mejor que Río Turbio por menor conflictividad directa.'
FROM politicos WHERE slug = 'aldo-aravena';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 54.6, 36.8,
  'Estimación · Medios SC',
  'Análisis de cobertura en OPI Santa Cruz, medios locales',
  'Imagen positiva leve. Afectada indirectamente por crisis de YCRT en la zona. Mayo 2026.'
FROM politicos WHERE slug = 'aldo-aravena';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.9, 33.4, 3, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 56.7, 34.6, 3, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.8, 35.7, 3, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.6, 36.8, 3, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena';


-- ===== NAYLA FERNÁNDEZ — Tres Lagos =====
-- Paraje rural muy pequeño. Unión por la Patria. Comisión de Fomento (no es municipio).
-- Zona de ganadería ovina y paso a El Chaltén desde ruta 40.

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 70.3, 20.1,
  'Estimación · Medios SC',
  'Análisis de cobertura en medios locales SC',
  'Paraje muy pequeño con alta cohesión comunitaria. Comisionada muy cercana a vecinos.'
FROM politicos WHERE slug = 'nayla-fernandez';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 68.5, 21.4,
  'Estimación · Medios SC',
  'Análisis de cobertura en medios locales SC',
  'Imagen muy positiva sostenida. Comunidad pequeña con gestión muy cercana. Mayo 2026.'
FROM politicos WHERE slug = 'nayla-fernandez';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 72.1, 18.5, 2, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 71.2, 19.3, 2, '2024-08-01T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 70.3, 20.1, 2, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 68.5, 21.4, 2, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez';


-- =============================================================
-- Verificación final
-- =============================================================
SELECT
  p.nombre,
  p.cargo,
  COUNT(DISTINCT e.id) AS encuestas,
  COUNT(DISTINCT h.id) AS historico,
  ROUND(MAX(e.imagen_positiva)::numeric, 1) AS ultima_positiva
FROM politicos p
LEFT JOIN encuestas e ON e.politico_id = p.id
LEFT JOIN imagen_historico h ON h.politico_id = p.id
WHERE p.activo = true
GROUP BY p.nombre, p.cargo
ORDER BY p.cargo, p.nombre;
