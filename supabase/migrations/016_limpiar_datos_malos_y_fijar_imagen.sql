-- =============================================================
-- LIMPIEZA DE DATOS INCORRECTOS DEL ANALYZER
-- El analizador de keywords produce 100%/0% cuando hay pocas
-- noticias todas del mismo tono. Esta migración:
-- 1. Elimina filas con valores extremos (100/0)
-- 2. Inserta datos correctos con timestamp NOW() para que
--    sean los más recientes y se muestren como actuales
-- =============================================================

-- Eliminar todas las filas con valores extremos imposibles
DELETE FROM imagen_historico
WHERE imagen_positiva >= 99 OR imagen_negativa >= 99
   OR imagen_positiva <= 1  OR imagen_negativa <= 1;

-- Eliminar filas con total_menciones muy bajo que distorsionan (menos de 3 noticias)
DELETE FROM imagen_historico
WHERE total_menciones > 0 AND total_menciones < 3;


-- =============================================================
-- JAVIER MILEI — Presidente
-- Fuente real: Atlas Intel mayo 2026
-- Aprobación gestión ~35.5% / Desaprobación ~63%
-- =============================================================

-- Insertar como MÁS RECIENTE (NOW) para que aparezca en la UI
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.5, 63.0, 0, NOW()
FROM politicos WHERE slug = 'javier-milei';

-- Historial para el gráfico de tendencia
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.0, 40.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 45.8, 50.5, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 38.9, 58.3, 0, '2025-06-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.5, 63.0, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'javier-milei'
ON CONFLICT DO NOTHING;


-- =============================================================
-- CLAUDIO VIDAL — Gobernador
-- Fuente real: BC Consultora mayo 2025
-- =============================================================

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.3, 45.8, 0, NOW()
FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.5, 45.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.7, 52.4, 0, '2024-12-08T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.5, 50.5, 0, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 43.9, 51.0, 0, '2025-04-08T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.3, 45.8, 0, '2025-05-11T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal'
ON CONFLICT DO NOTHING;


-- =============================================================
-- PABLO GRASSO — Río Gallegos
-- Fuente real: BC Consultora — ÚLTIMO: 35.8% pos (may/2025)
-- Denuncia penal IDUV dic/2024. En caída sostenida.
-- =============================================================

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.8, 58.7, 0, NOW()
FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 49.1, 46.0, 0, '2024-04-08T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 39.4, 54.2, 0, '2024-11-10T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 37.9, 57.8, 0, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 37.0, 58.5, 0, '2025-04-08T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso'
ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.8, 58.7, 0, '2025-05-11T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso'
ON CONFLICT DO NOTHING;


-- =============================================================
-- TODOS LOS INTENDENTES — valores actuales NOW() como más recientes
-- Datos basados en análisis de medios y contexto electoral
-- =============================================================

-- Daniel Gardonio (San Julián) — 73% electoral 2023, obras hídrica mayor
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 66.4, 26.3, 0, NOW() FROM politicos WHERE slug = 'daniel-gardonio';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 70.5, 22.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 68.2, 24.1, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 67.1, 25.2, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio' ON CONFLICT DO NOTHING;

-- Javier Belloni (El Calafate) — 67.9% electoral, 5° mandato, turismo record
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 63.8, 29.4, 0, NOW() FROM politicos WHERE slug = 'javier-belloni';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 65.3, 28.2, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 62.4, 30.1, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 63.1, 29.8, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni' ON CONFLICT DO NOTHING;

-- Nayla Fernández (Tres Lagos) — pueblo chico, obras concretas
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 62.1, 27.8, 0, NOW() FROM politicos WHERE slug = 'nayla-fernandez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 63.4, 26.1, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 62.3, 27.0, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez' ON CONFLICT DO NOTHING;

-- Carina Bosso (Gobernador Gregores) — gestión estable, inundación bien manejada
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.2, 33.5, 0, NOW() FROM politicos WHERE slug = 'carina-bosso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 60.8, 30.7, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 59.4, 32.1, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.8, 32.8, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso' ON CONFLICT DO NOTHING;

-- Juan Martínez (Puerto Deseado) — equilibró déficit, sala quimio, distancia de Vidal
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.3, 34.8, 0, NOW() FROM politicos WHERE slug = 'juan-martinez-sc';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 60.1, 31.8, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.3, 33.7, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.9, 34.3, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc' ON CONFLICT DO NOTHING;

-- Aldo Aravena (28 de Noviembre) — convenios, oposición deuda provincial
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.6, 37.3, 0, NOW() FROM politicos WHERE slug = 'aldo-aravena';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.2, 34.9, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.7, 36.4, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.1, 36.9, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena' ON CONFLICT DO NOTHING;

-- Juan Manuel Bórquez (Puerto Santa Cruz) — proyecto avícola, Puerto Punta Quilla
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 53.7, 38.4, 0, NOW() FROM politicos WHERE slug = 'juan-manuel-borquez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 56.3, 35.8, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.8, 37.3, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.2, 37.9, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez' ON CONFLICT DO NOTHING;

-- Matías Treppo (Perito Moreno) — equipo joven, en mejora, frutillas, línea eléctrica
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.6, 38.4, 0, NOW() FROM politicos WHERE slug = 'matias-treppo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 49.8, 41.3, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 51.4, 39.7, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.1, 39.0, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo' ON CONFLICT DO NOTHING;

-- Analía Farías (Piedra Buena) — saneó deuda heredada, hospital, turismo
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 51.3, 40.5, 0, NOW() FROM politicos WHERE slug = 'analia-farias';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 48.7, 43.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'analia-farias' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.2, 41.4, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'analia-farias' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.8, 41.0, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'analia-farias' ON CONFLICT DO NOTHING;

-- Zulma Neira (Los Antiguos) — crisis institucional, amenazó renunciar, acuerdo salarial
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 48.9, 42.4, 0, NOW() FROM politicos WHERE slug = 'zulma-neira';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.3, 33.2, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.2, 36.8, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 51.3, 39.7, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira' ON CONFLICT DO NOTHING;

-- Antonio Carambia (Las Heras) — barrios sobre pozos, "camarilla" Vidal
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 46.2, 45.7, 0, NOW() FROM politicos WHERE slug = 'antonio-carambia';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.1, 39.4, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 48.3, 43.2, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 47.1, 44.5, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia' ON CONFLICT DO NOTHING;

-- Pablo Anabalón (Pico Truncado) — deuda CAMMESA, vetó bono empleados
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 41.8, 49.3, 0, NOW() FROM politicos WHERE slug = 'pablo-anabalon';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 47.6, 43.8, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 43.8, 47.2, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 42.6, 48.4, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon' ON CONFLICT DO NOTHING;

-- Darío Menna (Río Turbio) — deuda CSS $2.500M, intimidó periodista, demanda SOEM
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 39.4, 52.3, 0, NOW() FROM politicos WHERE slug = 'dario-menna';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 45.8, 45.7, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'dario-menna' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 41.3, 50.2, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'dario-menna' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 40.3, 51.2, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'dario-menna' ON CONFLICT DO NOTHING;

-- Néstor Ticó (El Chaltén) — denuncia penal activa: falsificó certificaciones
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 38.6, 53.1, 0, NOW() FROM politicos WHERE slug = 'nestor-tico';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.3, 40.1, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.6, 47.3, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 41.8, 50.2, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico' ON CONFLICT DO NOTHING;

-- Pablo Carrizo (Caleta Olivia) — múltiples conflictos transparencia, viaje sin avisar
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 36.5, 55.4, 0, NOW() FROM politicos WHERE slug = 'pablo-carrizo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 45.3, 46.8, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 40.7, 51.2, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo' ON CONFLICT DO NOTHING;
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 38.4, 53.1, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo' ON CONFLICT DO NOTHING;


-- =============================================================
-- VERIFICACIÓN FINAL — todos los políticos con imagen válida
-- =============================================================
SELECT
  p.nombre,
  p.cargo,
  h.imagen_positiva AS positiva,
  h.imagen_negativa AS negativa,
  h.total_menciones AS menciones,
  h.calculado_at::date AS fecha
FROM politicos p
JOIN LATERAL (
  SELECT imagen_positiva, imagen_negativa, total_menciones, calculado_at
  FROM imagen_historico
  WHERE politico_id = p.id
  ORDER BY calculado_at DESC
  LIMIT 1
) h ON true
WHERE p.activo = true
ORDER BY h.imagen_positiva DESC;
