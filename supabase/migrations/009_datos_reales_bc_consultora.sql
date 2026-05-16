-- =============================================================
-- DATOS REALES — BC Consultora / OPI Santa Cruz
-- Fuente: https://www.opisantacruz.com.ar
-- Encuesta nacional mensual de imagen de gobernadores e intendentes
-- =============================================================

-- ---------------------------------------------------------------
-- ENCUESTAS: datos de BC Consultora para el módulo /encuestas
-- ---------------------------------------------------------------

-- Claudio Vidal — Mayo 2025 (último disponible)
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-05-11', 44.3, 45.8, 'BC Consultora', 'Encuesta nacional mensual, universo: gobernadores de 24 provincias',
  'Ranking: 24°/24 gobernadores. Favorable 48.5% / Desfavorable 45.8% / NS-NC 6.7%. Fuente: OPI Santa Cruz'
FROM politicos WHERE slug = 'claudio-vidal';

-- Claudio Vidal — Abril 2025
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-04-08', 43.9, 51.0, 'BC Consultora', 'Encuesta nacional mensual',
  'Ranking: 24°/24 gobernadores (último). Cayó 0.6 puntos vs marzo.'
FROM politicos WHERE slug = 'claudio-vidal';

-- Claudio Vidal — Marzo 2025
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 44.5, 50.5, 'BC Consultora', 'Encuesta nacional mensual',
  'Ranking: 20°/24 gobernadores.'
FROM politicos WHERE slug = 'claudio-vidal';

-- Claudio Vidal — Diciembre 2024
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-12-08', 44.7, 52.4, 'BC Consultora', 'Encuesta nacional mensual',
  'Ranking: 20°/24. Muy buena 29% + Buena 15.7%. Cayó desde 50.5% de abril/24.'
FROM politicos WHERE slug = 'claudio-vidal';

-- ---------------------------------------------------------------

-- Pablo Grasso — Mayo 2025 (último disponible)
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-05-11', 35.8, 58.7, 'BC Consultora', 'Encuesta nacional mensual, universo: intendentes de capitales',
  'Ranking: 24°/24 (último entre intendentes de capitales). Favorable 36.9% / Desfavorable 58.7% / NS-NC 4.4%. Fuente: OPI Santa Cruz'
FROM politicos WHERE slug = 'pablo-grasso';

-- Pablo Grasso — Abril 2025
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-04-08', 37.0, 58.5, 'BC Consultora', 'Encuesta nacional mensual',
  'Ranking: 24°/24 intendentes de capitales (último en el país). Cayó 0.9 puntos vs marzo.'
FROM politicos WHERE slug = 'pablo-grasso';

-- Pablo Grasso — Marzo 2025
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 37.9, 57.8, 'BC Consultora', 'Encuesta nacional mensual',
  'Ranking: 22°/24 intendentes de capitales.'
FROM politicos WHERE slug = 'pablo-grasso';

-- Pablo Grasso — Diciembre 2024
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-12-08', 37.5, 57.2, 'BC Consultora', 'Encuesta nacional mensual',
  'Ranking: 23°/24. Muy buena 15.8% + Buena 21.7%. NS-NC 5.3%. Cayó desde 49.1% en abril/24.'
FROM politicos WHERE slug = 'pablo-grasso';


-- ---------------------------------------------------------------
-- IMAGEN_HISTORICO: historial de tendencia para el gráfico
-- Usa los datos reales de BC Consultora como base histórica
-- ---------------------------------------------------------------

-- Claudio Vidal — historial mensual
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.5, 45.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 48.2, 47.0, 0, '2024-07-01T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 46.1, 49.5, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.7, 52.4, 0, '2024-12-08T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.5, 50.5, 0, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 43.9, 51.0, 0, '2025-04-08T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.3, 45.8, 0, '2025-05-11T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';

-- Pablo Grasso — historial mensual
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 49.1, 46.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 45.3, 49.5, 0, '2024-07-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 41.0, 54.0, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 37.5, 57.2, 0, '2024-12-08T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 37.9, 57.8, 0, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 37.0, 58.5, 0, '2025-04-08T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.8, 58.7, 0, '2025-05-11T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';
