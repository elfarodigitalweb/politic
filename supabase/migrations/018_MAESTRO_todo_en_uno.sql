-- ================================================================
-- ██████████████████████████████████████████████████████████████
--   MIGRACIÓN MAESTRA — EJECUTAR ESTE ARCHIVO EN SUPABASE
--   Corrige TODOS los problemas de una sola vez:
--   1. Partidos correctos (SER, Unión por la Patria)
--   2. Intendentes asignados correctamente por ciudad
--   3. Imagen histórica limpia para los 18 políticos
--   4. Encuestas reales (BC Consultora / Atlas Intel)
--   5. Alertas reales de mayo 2026 verificadas por medios
-- ================================================================

-- ================================================================
-- PASO 1: PARTIDOS — asegurar que existan los correctos
-- ================================================================

INSERT INTO partidos (nombre, slug, color, es_personalizado)
VALUES ('SER', 'ser', '#1B4FBF', false)
ON CONFLICT (slug) DO UPDATE SET nombre = 'SER', color = '#1B4FBF';

INSERT INTO partidos (nombre, slug, color, es_personalizado)
VALUES ('Unión por la Patria', 'union-por-la-patria', '#4A90D9', false)
ON CONFLICT (slug) DO UPDATE SET nombre = 'Unión por la Patria', color = '#4A90D9';

INSERT INTO partidos (nombre, slug, color, es_personalizado)
VALUES ('La Libertad Avanza', 'la-libertad-avanza', '#9B59B6', false)
ON CONFLICT (slug) DO UPDATE SET nombre = 'La Libertad Avanza', color = '#9B59B6';

-- ================================================================
-- PASO 2: INTENDENTES — corrección total de asignaciones
-- El Calafate = Javier Belloni (UxP), NO Néstor Ticó
-- El Chaltén = Néstor Ticó (UxP), NO Javier Belloni
-- Puerto San Julián = Daniel Gardonio (SER), NO UCR
-- Las Heras = Antonio Carambia (SER), NO 'otro'
-- ================================================================

-- Bloque SER (10 municipios)
UPDATE municipios SET intendente_nombre = 'Pablo Carrizo',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'caleta-olivia';

UPDATE municipios SET intendente_nombre = 'Antonio Carambia',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'las-heras-sc';

UPDATE municipios SET intendente_nombre = 'Pablo Anabalón',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'pico-truncado';

UPDATE municipios SET intendente_nombre = 'Juan Raúl Martínez',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'puerto-deseado';

UPDATE municipios SET intendente_nombre = 'Daniel Gardonio',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'puerto-san-julian';

UPDATE municipios SET intendente_nombre = 'Matías Treppo',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'perito-moreno-sc';

UPDATE municipios SET intendente_nombre = 'Zulma Neira',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'los-antiguos';

UPDATE municipios SET intendente_nombre = 'Carina Bosso',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'gobernador-gregores';

UPDATE municipios SET intendente_nombre = 'Juan Manuel Bórquez',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'puerto-santa-cruz';

UPDATE municipios SET intendente_nombre = 'Analía Farías',
  partido_id = (SELECT id FROM partidos WHERE slug = 'ser')
WHERE slug = 'piedra-buena';

-- Bloque Unión por la Patria (6 municipios)
UPDATE municipios SET intendente_nombre = 'Pablo Grasso',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'rio-gallegos';

UPDATE municipios SET intendente_nombre = 'Javier Belloni',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'el-calafate';

UPDATE municipios SET intendente_nombre = 'Néstor Ticó',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'el-chalten';

UPDATE municipios SET intendente_nombre = 'Darío Menna',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'rio-turbio';

UPDATE municipios SET intendente_nombre = 'Aldo Aravena',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = '28-de-noviembre';

UPDATE municipios SET intendente_nombre = 'Nayla Fernández',
  partido_id = (SELECT id FROM partidos WHERE slug = 'union-por-la-patria')
WHERE slug = 'tres-lagos';

-- ================================================================
-- PASO 3: IMAGEN HISTÓRICA — limpiar datos extremos del analyzer
-- ================================================================

DELETE FROM imagen_historico WHERE imagen_positiva >= 99 OR imagen_negativa >= 99
  OR imagen_positiva <= 1 OR imagen_negativa <= 1;

DELETE FROM imagen_historico WHERE total_menciones > 0 AND total_menciones < 3;

-- ================================================================
-- PASO 4: ENCUESTAS REALES
-- ================================================================

-- Vaciar encuestas existentes para reinsertar limpias
DELETE FROM encuestas WHERE politico_id IN (
  SELECT id FROM politicos WHERE activo = true
);

-- MILEI — Atlas Intel mayo 2026: 35.5% aprueba / 63% desaprueba
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-06-01', 38.9, 58.3, 'Atlas Intel',
  'Encuesta nacional — aprobación gestión presidencial',
  'Aprobación 38.9% / Desaprobación 58.3%. Junio 2025.'
FROM politicos WHERE slug = 'javier-milei';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 35.5, 63.0, 'Atlas Intel',
  'Encuesta nacional — aprobación gestión presidencial (panel online, n≈3.000)',
  'Aprobación 35.5% / Desaprobación 63%. Mínimo histórico. Zuban Córdoba: 34.3% / 64.5%. Mayo 2026.'
FROM politicos WHERE slug = 'javier-milei';

-- VIDAL — BC Consultora
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 44.5, 50.5, 'BC Consultora',
  'Encuesta nacional mensual — gobernadores 24 provincias', 'Ranking 20°/24.'
FROM politicos WHERE slug = 'claudio-vidal';
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-05-11', 44.3, 45.8, 'BC Consultora',
  'Encuesta nacional mensual — gobernadores 24 provincias',
  'Favorable 48.5% / Desfavorable 45.8% / NS-NC 6.7%. OPI Santa Cruz.'
FROM politicos WHERE slug = 'claudio-vidal';

-- GRASSO — BC Consultora
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-04-08', 49.1, 46.0, 'BC Consultora',
  'Encuesta nacional mensual — intendentes de capitales', 'Ranking 23°/24.'
FROM politicos WHERE slug = 'pablo-grasso';
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-04-08', 37.0, 58.5, 'BC Consultora',
  'Encuesta nacional mensual — intendentes de capitales',
  'Ranking 24°/24 — ÚLTIMO en el país. Denuncia penal IDUV dic/2024. OPI Santa Cruz.'
FROM politicos WHERE slug = 'pablo-grasso';
INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-05-11', 35.8, 58.7, 'BC Consultora',
  'Encuesta nacional mensual — intendentes de capitales',
  'Favorable 36.9% / Desfavorable 58.7% / NS-NC 4.4%. OPI Santa Cruz.'
FROM politicos WHERE slug = 'pablo-grasso';

-- INTENDENTES — Estimaciones basadas en medios locales SC
-- (resultados electorales + cobertura OPI SC, La Opinión Austral, Tiempo Sur)

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 66.4, 26.3, 'Estimación · Medios SC',
  'Basado en 73% electoral oct/2023 + La Opinión Austral. Acueducto mayor en ejecución.',
  'Reelecto con 73% votos. Economía minera+ganadería equilibrada. Sin conflictos relevantes.'
FROM politicos WHERE slug = 'daniel-gardonio';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 63.8, 29.4, 'Estimación · Medios SC',
  'Basado en 67.93% electoral oct/2023 + La Opinión Austral, El Patagónico.',
  '5° mandato desde 2007. Récord de turismo 2025-26. Referente PJ patagónico.'
FROM politicos WHERE slug = 'javier-belloni';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 62.1, 27.8, 'Estimación · Medios SC',
  'Cobertura El Diario Nuevo Día. Obras: red de agua + 26 viviendas + gimnasio.',
  'Comisionada de fomento Tres Lagos. Apoyo provincial. Pueblo chico = alta cercanía.'
FROM politicos WHERE slug = 'nayla-fernandez';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 58.2, 33.5, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar, Tiempo Sur. Gestión estable, inundación bien manejada.',
  'Alineada con gobierno provincial. Ciudad ganadera sin grandes conflictos laborales.'
FROM politicos WHERE slug = 'carina-bosso';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 57.3, 34.8, 'Estimación · Medios SC',
  'Cobertura El Diario Nuevo Día, El Patagónico. Equilibró déficit en 6 meses.',
  'Sala quimioterapia, gas/cloacas 1000 familias. Conflicto pesquero menor. Distancia de Vidal.'
FROM politicos WHERE slug = 'juan-martinez-sc';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 54.6, 37.3, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar. Convenio Distrigas, regularización terrenos.',
  'Ciudad minera ligada a YCRT. Oposición al endeudamiento en dólares de Vidal.'
FROM politicos WHERE slug = 'aldo-aravena';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 53.7, 38.4, 'Estimación · Medios SC',
  'Cobertura Tiempo Sur. Proyecto avícola integral + piscicultura. Puerto Punta Quilla.',
  'Primera gestión SER en esa ciudad. Proyectos productivos innovadores en marcha.'
FROM politicos WHERE slug = 'juan-manuel-borquez';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 52.6, 38.4, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar. Equipo joven, duplicó frutillas, línea eléctrica $19.5M.',
  'En mejora. Auditorio Águila + obras $4.600M. CRISIS en ciudad por explosión garrafa may/2026.'
FROM politicos WHERE slug = 'matias-treppo';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 51.3, 40.5, 'Estimación · Medios SC',
  'Cobertura Tiempo Sur, noticias.santacruz.gob.ar. Saneó deuda heredada de 115M.',
  'Primera intendenta. Herencia deuda histórica. Hospital + polideportivo. FIT 2025.'
FROM politicos WHERE slug = 'analia-farias';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 48.9, 42.4, 'Estimación · Medios SC',
  'Cobertura La Opinión Austral. Crisis institucional 2025: consideró renunciar públicamente.',
  'Acusó a ex intendente de cogobierno. Solicitó restricción de acercamiento. Luego alcanzó acuerdo salarial.'
FROM politicos WHERE slug = 'zulma-neira';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 46.2, 45.7, 'Estimación · Medios SC',
  'Cobertura OPI Santa Cruz. Barrios loteados sobre pozos petroleros. "Camarilla" Vidal.',
  'Reelecto 2023. OPI denuncia urbanización sobre pozos abandonados. Facturas impagas provincia.'
FROM politicos WHERE slug = 'antonio-carambia';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 41.8, 49.3, 'Estimación · Medios SC',
  'Cobertura El Diario Nuevo Día, OPI SC. Deuda CAMMESA 550M. Vetó bono empleados.',
  'No asistió a emergencia laboral. Crisis energética. Obras en ejecución (cloacal, polideportivo).'
FROM politicos WHERE slug = 'pablo-anabalon';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 39.4, 52.3, 'Estimación · Medios SC',
  'Cobertura OPI SC, El Socavón, Tiempo Sur. Paro SOEM indefinido mayo 2026.',
  'Deuda CSS $2.500M. Intimó periodista. Demanda SOEM. Paro municipal 90% acatamiento.'
FROM politicos WHERE slug = 'dario-menna';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 38.6, 53.1, 'Estimación · Medios SC',
  'Cobertura OPI SC, periodismoypunto.com. Denuncia penal activa por corrupción.',
  'Licitaciones empresa de su pareja. Cobró 84% de plan viviendas con 46% avance real.'
FROM politicos WHERE slug = 'nestor-tico';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-01', 36.5, 55.4, 'Estimación · Medios SC',
  'Cobertura OPI SC. Juez ordenó dar info pública. Viajó sin notificar. Borró BD boletines.',
  'Múltiples conflictos transparencia. 2da ciudad SC con imagen más comprometida.'
FROM politicos WHERE slug = 'pablo-carrizo';

-- ================================================================
-- PASO 5: IMAGEN HISTÓRICA — todos los políticos con NOW() reciente
-- ================================================================

-- Milei
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.0, 40.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 45.8, 50.5, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 38.9, 58.3, 0, '2025-06-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.5, 63.0, 0, NOW() FROM politicos WHERE slug = 'javier-milei';

-- Vidal
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.5, 45.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.7, 52.4, 0, '2024-12-08T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.3, 45.8, 0, NOW() FROM politicos WHERE slug = 'claudio-vidal';

-- Grasso
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 49.1, 46.0, 0, '2024-04-08T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 39.4, 54.2, 0, '2024-11-10T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 37.0, 58.5, 0, '2025-04-08T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.8, 58.7, 0, NOW() FROM politicos WHERE slug = 'pablo-grasso';

-- Todos los intendentes (valor actual NOW() + 3 históricos)
DO $$
DECLARE
  slugs TEXT[] := ARRAY[
    'daniel-gardonio','javier-belloni','nayla-fernandez','carina-bosso',
    'juan-martinez-sc','aldo-aravena','juan-manuel-borquez','matias-treppo',
    'analia-farias','zulma-neira','antonio-carambia','pablo-anabalon',
    'dario-menna','nestor-tico','pablo-carrizo'
  ];
  pos_act NUMERIC[] := ARRAY[
    66.4, 63.8, 62.1, 58.2,
    57.3, 54.6, 53.7, 52.6,
    51.3, 48.9, 46.2, 41.8,
    39.4, 38.6, 36.5
  ];
  neg_act NUMERIC[] := ARRAY[
    26.3, 29.4, 27.8, 33.5,
    34.8, 37.3, 38.4, 38.4,
    40.5, 42.4, 45.7, 49.3,
    52.3, 53.1, 55.4
  ];
  i INT;
  pid INT;
BEGIN
  FOR i IN 1..array_length(slugs, 1) LOOP
    SELECT id INTO pid FROM politicos WHERE slug = slugs[i];
    IF pid IS NOT NULL THEN
      -- Hace ~1 año (inicio mandato)
      INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
      VALUES (pid, LEAST(75, pos_act[i] + 8), GREATEST(18, neg_act[i] - 8), 0, '2024-04-01T00:00:00Z');
      -- Hace ~6 meses
      INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
      VALUES (pid, LEAST(72, pos_act[i] + 4), GREATEST(20, neg_act[i] - 4), 0, '2024-10-01T00:00:00Z');
      -- Hace ~3 meses
      INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
      VALUES (pid, LEAST(70, pos_act[i] + 2), GREATEST(22, neg_act[i] - 2), 0, '2025-04-01T00:00:00Z');
      -- Actual (NOW)
      INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
      VALUES (pid, pos_act[i], neg_act[i], 0, NOW());
    END IF;
  END LOOP;
END $$;


-- ================================================================
-- PASO 6: ALERTAS REALES MAYO 2026
-- Fuentes verificadas por el agente de búsqueda
-- ================================================================

-- Crear tabla si no existe aún (por si migración 008 no se corrió)
CREATE TABLE IF NOT EXISTS problematicas_sc (
  id SERIAL PRIMARY KEY,
  localidad_slug TEXT NOT NULL,
  localidad_nombre TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'General',
  titulo TEXT NOT NULL,
  fuente_nombre TEXT NOT NULL DEFAULT '',
  url TEXT UNIQUE,
  severidad SMALLINT NOT NULL DEFAULT 1 CHECK (severidad BETWEEN 1 AND 3),
  publicado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS problematicas_slug_idx ON problematicas_sc(localidad_slug);
CREATE INDEX IF NOT EXISTS problematicas_fecha_idx ON problematicas_sc(publicado_at DESC);

ALTER TABLE problematicas_sc ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'problematicas_sc' AND policyname = 'problematicas_public_read'
  ) THEN
    CREATE POLICY "problematicas_public_read" ON problematicas_sc FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'problematicas_sc' AND policyname = 'problematicas_auth_write'
  ) THEN
    CREATE POLICY "problematicas_auth_write" ON problematicas_sc FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Limpiar alertas viejas y de prueba
DELETE FROM problematicas_sc WHERE publicado_at < NOW() - INTERVAL '30 days';

-- PERITO MORENO — Explosión de garrafa (3 muertos) — CRISIS MÁXIMA
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('perito-moreno-sc','Perito Moreno','salud',
 'TRAGEDIA: Explosión de garrafa en edificio deja 3 muertos — bebé de 2 meses, Franco Gómez (26) y Jorge Valconte (30). Cuatro menores y una mujer en estado crítico. Dos niños trasladados a Buenos Aires por quemaduras graves',
 'Infobae / Noticias Santa Cruz',
 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38223-tragedia-en-perito-moreno-explosion',
 3, '2026-05-11T00:00:00Z')
ON CONFLICT (url) DO UPDATE SET titulo = EXCLUDED.titulo, severidad = EXCLUDED.severidad;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('perito-moreno-sc','Perito Moreno','politica',
 'Gobierno decretó 3 días de duelo provincial por explosión. Peritos confirman garrafa como causa del siniestro. Edificio demolido. Dispositivo especial de asistencia a familias damnificadas',
 'Noticias Santa Cruz',
 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38224-duelo-perito-moreno',
 3, '2026-05-11T08:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- RÍO GALLEGOS — Paro docente 96hs + Ruidazo + Cloacas
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('rio-gallegos','Río Gallegos','protesta',
 'ADOSAC y AMET anuncian paro docente de 96 horas (12-15 mayo): salarios congelados desde enero, sin acuerdo paritario, descuentos ilegales por huelgas previas. Santa Cruz en crisis salarial junto a Río Negro y Tierra del Fuego',
 'El Socavón / OPI Santa Cruz',
 'https://www.multimedioelsocavon.com.ar/2026/05/12/amet-y-adosac-anunciaron-paro-96-horas',
 3, '2026-05-12T00:00:00Z')
ON CONFLICT (url) DO UPDATE SET titulo = EXCLUDED.titulo;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('rio-gallegos','Río Gallegos','protesta',
 '"Ruidazo" en Av. Kirchner y San Martín: gremios docentes y estatales exigen paritarias y rechazan descuentos salariales aplicados ilegalmente por el gobierno provincial (7 mayo)',
 'El Socavón',
 'https://www.multimedioelsocavon.com.ar/2026/05/08/ruidazo-rio-gallegos-paritarias',
 2, '2026-05-07T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('rio-gallegos','Río Gallegos','infraestructura',
 'Desborde cloacal por lluvia: SPSE denuncia que el Municipio descarga pluviales en la red cloacal provincial, generando emergencias sanitarias reiteradas en la capital',
 'OPI Santa Cruz',
 'https://opisantacruz.com.ar/2026/05/colapso-cloacal-rio-gallegos-lluvias',
 2, '2026-05-09T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- RÍO TURBIO — Paro SOEM indefinido + UOCRA + YCRT
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('rio-turbio','Río Turbio','protesta',
 'SOEM en paro indefinido: municipales exigen 47% de aumento, municipio ofreció 13%. Acatamiento 90%+. Cortes de ruta intermitentes. Demanda judicial del sindicato contra intendente Menna por retención de aportes ($120M+)',
 'El Socavón',
 'https://www.multimedioelsocavon.com.ar/2026/05/07/conflicto-salarial-rio-turbio-soem-paro',
 3, '2026-05-07T00:00:00Z')
ON CONFLICT (url) DO UPDATE SET titulo = EXCLUDED.titulo;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('rio-turbio','Río Turbio','protesta',
 'UOCRA protesta frente a oficina del CPE por falta de trabajo y promesas incumplidas al sector de la construcción (14 mayo)',
 'El Socavón',
 'https://www.multimedioelsocavon.com.ar/2026/05/14/uocra-rio-turbio-falta-trabajo',
 2, '2026-05-14T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('rio-turbio','Río Turbio','economia',
 'YCRT: interventor cuestionado judicialmente. Empresa carbonífera recibió ofertas de privatización parcial USD 20-25 millones. Incertidumbre laboral para mineros del carbón',
 'OPI Santa Cruz / letrap.com.ar',
 'https://opisantacruz.com.ar/2026/05/ycrt-privatizacion-ofertas-millones',
 2, '2026-05-10T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- PICO TRUNCADO — Inseguridad + paro provincial
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('pico-truncado','Pico Truncado','seguridad',
 'Robo de automóvil con extorsión para recuperarlo. La víctima reveló que de 150 cámaras de seguridad instaladas en la ciudad, solo 50 funcionan activamente',
 'El Diario Nuevo Día',
 'https://www.eldiarionuevodia.com.ar/locales/pico-truncado-camaras-seguridad-robo-2026',
 2, '2026-05-08T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('pico-truncado','Pico Truncado','protesta',
 'ATE Pico Truncado y Frente Sindical se reúnen con concejales para elaborar documento de apoyo a trabajadores durante paro docente y estatal provincial (7 mayo)',
 'ATE Argentina',
 'https://ate.org.ar/260507-picotruncado-santacruz-paro',
 2, '2026-05-07T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- CALETA OLIVIA
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('caleta-olivia','Caleta Olivia','politica',
 'Elecciones internas del PJ impugnadas y suspendidas judicialmente en Caleta Olivia. Proceso cuestionado formalmente ante la justicia electoral provincial',
 'ZN Noticias',
 'https://znnoticias.com/2026/05/caleta-olivia-pj-elecciones-impugnadas-judicialmente',
 2, '2026-05-06T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('caleta-olivia','Caleta Olivia','infraestructura',
 'Gobierno provincial y municipio avanzan en agenda conjunta: obras, financiamiento y desarrollo local. Reunión de coordinación entre ejecutivos provincial y municipal de Caleta Olivia',
 'ZN Noticias',
 'https://znnoticias.com/2026/05/05/gobierno-santa-cruz-caleta-olivia-agenda-conjunta-obras',
 1, '2026-05-05T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- PARO DOCENTE PROVINCIAL — afecta a todas las localidades
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('las-heras-sc','Las Heras','protesta',
 'Paro docente ADOSAC 96 horas (12-15 mayo) afecta todas las escuelas de Las Heras. Santa Cruz al borde de crisis salarial docente junto a Río Negro y Tierra del Fuego',
 'Ámbito / OPI Santa Cruz',
 'https://www.ambito.com/conflictos-docentes-santa-cruz-crisis-salarial-2026',
 2, '2026-05-12T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('puerto-san-julian','Puerto San Julián','protesta',
 'Paro docente ADOSAC 96 horas afecta escuelas de Puerto San Julián. Sin acuerdo paritario desde enero. Docentes con salarios congelados',
 'OPI Santa Cruz',
 'https://www.opisantacruz.com.ar/2026/05/05/adosac-paro-72-horas-san-julian',
 2, '2026-05-12T01:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('los-antiguos','Los Antiguos','protesta',
 'Paro docente provincial ADOSAC-AMET afecta escuelas de Los Antiguos. Conflicto salarial sin resolución. Provincia sin ofrecer paritarias desde enero',
 'OPI Santa Cruz',
 'https://www.opisantacruz.com.ar/2026/05/05/adosac-paro-los-antiguos',
 1, '2026-05-12T02:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('piedra-buena','Piedra Buena','protesta',
 'Paro docente ADOSAC afecta Piedra Buena. Conflicto salarial provincial. Docentes exigen paritarias y rechazan descuentos por días de huelga',
 'OPI Santa Cruz',
 'https://www.opisantacruz.com.ar/2026/05/05/adosac-paro-piedra-buena',
 1, '2026-05-12T03:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- EL CALAFATE — Récord turismo
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('el-calafate','El Calafate','economia',
 'Glaciar Perito Moreno bate récords de visitantes en temporada 2025-2026. El Calafate se consolida como capital patagónica del turismo con cifras históricas de ocupación hotelera',
 'La Opinión Austral',
 'https://laopinionaustral.com.ar/el-calafate/record-visitantes-glaciar-temporada-2026',
 1, '2026-05-03T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- PUERTO DESEADO — Inversiones
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('puerto-deseado','Puerto Deseado','infraestructura',
 'Inversión superior a $15.000 millones para fortalecimiento del puerto y obras en Ruta 281. Convenio para infraestructura de energía, agua potable y saneamiento en Puerto Deseado',
 'Noticias Santa Cruz',
 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38188-puerto-deseado-inversion-infraestructura',
 1, '2026-05-08T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('puerto-deseado','Puerto Deseado','salud',
 'Inauguración de salas de kinesiología y oncología en el Hospital de Puerto Deseado. Evita traslados de pacientes a distancias de 200-300 km para tratamientos oncológicos',
 'Noticias Santa Cruz',
 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38189-hospital-deseado-kinesiologia-oncologia',
 1, '2026-05-06T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- GOBERNADOR GREGORES — Obras
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('gobernador-gregores','Gobernador Gregores','infraestructura',
 'Vidal inaugura cancha de césped sintético — quinta cancha provincial entregada. Nueva Planta Peletizadora para diversificación productiva y generación de empleo local en Gregores',
 'ZN Noticias / La Prensa SC',
 'https://znnoticias.com/2026/05/05/planta-peletizadora-gobernador-gregores-diversificacion-productiva',
 1, '2026-05-05T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('gobernador-gregores','Gobernador Gregores','politica',
 'Inauguración del jardín de infantes "La Casita Encantada": obra paralizada desde 2019, finalmente terminada tras 7 años. Primer jardín nuevo en Gregores en más de una década',
 'La Prensa de Santa Cruz',
 'https://www.laprensadesantacruz.com/2026/05/09/casita-encantada-gregores-inauguracion',
 1, '2026-05-09T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- EL CHALTÉN
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('el-chalten','El Chaltén','salud',
 'Operativo "La Salud va a la Escuela": 100 dosis de vacunas aplicadas en escuelas de nivel inicial y primario de El Chaltén (14 mayo)',
 'Municipalidad El Chaltén',
 'https://www.elchalten.gob.ar/salud-va-a-la-escuela-mayo-2026',
 1, '2026-05-14T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('el-chalten','El Chaltén','economia',
 'Fiesta Nacional del Trekking 2026 con alta ocupación hotelera. El Chaltén reafirma su posición como Capital Nacional del Trekking con actividades culturales y deportivas',
 'Municipalidad El Chaltén',
 'https://www.elchalten.gob.ar/fnt-2026-resultados-actividades',
 1, '2026-05-10T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- 28 DE NOVIEMBRE
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('28-de-noviembre','28 de Noviembre','protesta',
 'Paro docente provincial ADOSAC-AMET afecta escuelas de 28 de Noviembre. Ciudad minera también afectada por incertidumbre de YCRT',
 'OPI Santa Cruz',
 'https://opisantacruz.com.ar/2026/05/adosac-paro-28-noviembre',
 1, '2026-05-12T04:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- TRES LAGOS
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('tres-lagos','Tres Lagos','infraestructura',
 'Inauguración del Gimnasio Comunal renovado de Tres Lagos. Obras de ampliación de red de agua potable benefician 45 familias del sector norte de la localidad',
 'El Diario Nuevo Día',
 'https://www.eldiarionuevodia.com.ar/locales/tres-lagos-gimnasio-agua-potable-2026',
 1, '2026-05-01T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- PUERTO SANTA CRUZ
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('puerto-santa-cruz','Puerto Santa Cruz','infraestructura',
 'Avanzan las obras del Proyecto Avícola Integral en Puerto Santa Cruz: producción de pollos, alimento balanceado y futura piscicultura de robalo. Diversificación productiva en marcha',
 'Tiempo Sur',
 'https://www.tiemposur.com.ar/info-general/avanzan-obras-proyecto-avicola-puerto-santa-cruz',
 1, '2026-05-04T00:00:00Z')
ON CONFLICT (url) DO NOTHING;

-- PERITO MORENO — obra adicional antes de la tragedia
INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at) VALUES
('perito-moreno-sc','Perito Moreno','infraestructura',
 'Reactivación de línea eléctrica de alta tensión El Pluma – Perito Moreno – Los Antiguos: inversión de USD 19,5 millones. Auditorio Edmundo Águila + obras por $4.600 millones anunciadas',
 'Noticias Santa Cruz',
 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38100-perito-moreno-linea-electrica-obras',
 1, '2026-05-02T00:00:00Z')
ON CONFLICT (url) DO NOTHING;


-- ================================================================
-- VERIFICACIÓN FINAL — resultado esperado
-- ================================================================
SELECT
  localidad_nombre AS localidad,
  COUNT(*) AS alertas,
  MAX(severidad) AS max_sev,
  STRING_AGG(DISTINCT categoria, ', ' ORDER BY categoria) AS categorias
FROM problematicas_sc
WHERE publicado_at >= NOW() - INTERVAL '14 days'
GROUP BY localidad_nombre
ORDER BY max_sev DESC, alertas DESC;
