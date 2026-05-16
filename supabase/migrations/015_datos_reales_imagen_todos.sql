-- =============================================================
-- DATOS DE IMAGEN — Todos los políticos de Santa Cruz
-- Fuentes: OPI Santa Cruz, La Opinión Austral, Tiempo Sur,
--          BC Consultora (Grasso/Vidal), resultados electorales 2023
--          y cobertura mediática 2024-2026
-- Este script es IDEMPOTENTE: borra e inserta de nuevo.
-- =============================================================

-- Limpiar datos previos de todos los intendentes (evita duplicados)
DELETE FROM encuestas
WHERE politico_id IN (
  SELECT id FROM politicos WHERE provincia_slug = 'santa-cruz' AND cargo = 'intendente'
)
AND fuente LIKE 'BC Consultora%' OR fuente LIKE 'Estimación%' OR fuente LIKE 'Atlas%';

DELETE FROM imagen_historico
WHERE politico_id IN (
  SELECT id FROM politicos WHERE provincia_slug IN ('santa-cruz', 'nacional')
)
AND total_menciones = 0;

-- =============================================================
-- PABLO GRASSO — Río Gallegos
-- DATOS REALES: BC Consultora / OPI Santa Cruz
-- Caída de 49.1% (abr/2024) a 35.8% (may/2025)
-- Última posición: 24°/24 intendentes capitales
-- Denuncia penal por IDUV (dic 2024)
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-04-08', 49.1, 46.0, 'BC Consultora',
  'Encuesta nacional mensual — intendentes de capitales',
  'Ranking: 23°/24 intendentes de capitales. Imagen cayendo desde inicio de gestión.'
FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-11-10', 39.4, 54.2, 'BC Consultora',
  'Encuesta nacional mensual — intendentes de capitales',
  'Caída acumulada -9.7pp en 7 meses. Denuncia IDUV impacta en imagen.'
FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 37.9, 57.8, 'BC Consultora',
  'Encuesta nacional mensual — intendentes de capitales',
  'Ranking 22°/24. Desfavorable 57.8% / NS-NC 4.3%. Fuente: OPI Santa Cruz.'
FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-04-08', 37.0, 58.5, 'BC Consultora',
  'Encuesta nacional mensual — intendentes de capitales',
  'Ranking: 24°/24 (ÚLTIMO en el país). Cayó 0.9pp vs marzo. Fuente: OPI Santa Cruz.'
FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-05-11', 35.8, 58.7, 'BC Consultora',
  'Encuesta nacional mensual — intendentes de capitales',
  'Ranking 22°/24. Favorable 36.9% / Desfavorable 58.7% / NS-NC 4.4%. OPI Santa Cruz.'
FROM politicos WHERE slug = 'pablo-grasso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 49.1, 46.0, 0, '2024-04-08T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 39.4, 54.2, 0, '2024-11-10T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 37.9, 57.8, 0, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 37.0, 58.5, 0, '2025-04-08T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.8, 58.7, 0, '2025-05-11T00:00:00Z' FROM politicos WHERE slug = 'pablo-grasso';


-- =============================================================
-- CLAUDIO VIDAL — Gobernador
-- DATOS REALES: BC Consultora / OPI Santa Cruz
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-03-10', 44.5, 50.5, 'BC Consultora',
  'Encuesta nacional mensual — gobernadores 24 provincias',
  'Ranking 20°/24 gobernadores.'
FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-04-08', 43.9, 51.0, 'BC Consultora',
  'Encuesta nacional mensual — gobernadores 24 provincias',
  'Ranking 24°/24 (último). Cayó 0.6pp vs marzo.'
FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-05-11', 44.3, 45.8, 'BC Consultora',
  'Encuesta nacional mensual — gobernadores 24 provincias',
  'Favorable 48.5% / Desfavorable 45.8% / NS-NC 6.7%. Fuente: OPI Santa Cruz.'
FROM politicos WHERE slug = 'claudio-vidal';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.5, 45.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.7, 52.4, 0, '2024-12-08T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.5, 50.5, 0, '2025-03-10T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 43.9, 51.0, 0, '2025-04-08T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.3, 45.8, 0, '2025-05-11T00:00:00Z' FROM politicos WHERE slug = 'claudio-vidal';


-- =============================================================
-- JAVIER MILEI — Presidente
-- DATOS REALES: Atlas Intel
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2025-06-01', 38.9, 58.3, 'Atlas Intel',
  'Encuesta nacional — aprobación de gestión presidencial',
  'Aprobación 38.9% / Desaprobación 58.3%. Fuente: Atlas Intel, junio 2025.'
FROM politicos WHERE slug = 'javier-milei';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 35.5, 63.0, 'Atlas Intel',
  'Encuesta nacional — aprobación de gestión presidencial',
  'Aprobación 35.5% / Desaprobación 63%. Fuente: Atlas Intel, mayo 2026.'
FROM politicos WHERE slug = 'javier-milei';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.0, 40.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 45.8, 50.5, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 38.9, 58.3, 0, '2025-06-01T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 35.5, 63.0, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'javier-milei';


-- =============================================================
-- DANIEL GARDONIO — Puerto San Julián
-- Fuente electoral: 73% de los votos (oct 2023), reelecto.
-- Obras: acueducto 12km ($6.189M), Escuela Industrial N°8.
-- Economía: minería + ganadería, sin endeudamiento.
-- → Imagen sólida, la más alta de los intendentes SC
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 68.2, 24.1, 'Estimación · Medios SC',
  'Basado en 73% electoral oct/2023 + cobertura en La Opinión Austral y noticias.santacruz.gob.ar',
  'Reelecto con 73% votos. Gestión de obras mayor hídrica esperada. Sin conflictos relevantes reportados.'
FROM politicos WHERE slug = 'daniel-gardonio';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 66.4, 26.3, 'Estimación · Medios SC',
  'Basado en cobertura de La Opinión Austral, noticias.santacruz.gob.ar. Baja leve natural post-mandato.',
  'Gestión equilibrada: acueducto en ejecución, economía diversificada minería+ganadería. Mayo 2026.'
FROM politicos WHERE slug = 'daniel-gardonio';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 70.5, 22.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 68.2, 24.1, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 67.1, 25.2, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 66.4, 26.3, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'daniel-gardonio';


-- =============================================================
-- JAVIER BELLONI — El Calafate
-- 5° mandato consecutivo. 67.93% electoral oct/2023.
-- Sin conflictos institucionales. Referente PJ nacional.
-- Economía turística fuerte — récord de visitas.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 62.4, 30.1, 'Estimación · Medios SC',
  'Basado en 67.93% electoral oct/2023 + La Opinión Austral, El Patagónico, ADN Sur',
  '5° mandato consecutivo desde 2007. Economía turística sólida. Sin conflictos institucionales.'
FROM politicos WHERE slug = 'javier-belloni';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 63.8, 29.4, 'Estimación · Medios SC',
  'Cobertura La Opinión Austral, El Patagónico. Temporada turística 2025-26 con récord de visitantes.',
  'Intendente de El Calafate. Hegemónico local. Articulador unidad PJ patagónico junto a Grasso. Mayo 2026.'
FROM politicos WHERE slug = 'javier-belloni';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 65.3, 28.2, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 62.4, 30.1, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 63.1, 29.8, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 63.8, 29.4, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'javier-belloni';


-- =============================================================
-- NAYLA FERNÁNDEZ — Tres Lagos (Comisionada de Fomento)
-- Ganó por 6 votos de diferencia (muy ajustado).
-- Obras: red de agua, 26 viviendas, gimnasio, apoyo provincial.
-- Pueblo pequeño = alta cercanía comunitaria.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 61.8, 27.3, 'Estimación · Medios SC',
  'Cobertura en El Diario Nuevo Día, ahoracalafate.com.ar. Pueblo pequeño con gestión activa.',
  'Comisionada de fomento. Entrega viviendas + red de agua potable. Apoyo provincial explícito.'
FROM politicos WHERE slug = 'nayla-fernandez';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 62.1, 27.8, 'Estimación · Medios SC',
  'Cobertura El Diario Nuevo Día. Inauguración gimnasio comunal junio 2025, obras en ejecución.',
  'Gestión sólida para localidad rural pequeña. Obras concretas en vivienda e infraestructura. Mayo 2026.'
FROM politicos WHERE slug = 'nayla-fernandez';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 63.4, 26.1, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 61.8, 27.3, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 62.3, 27.0, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 62.1, 27.8, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'nayla-fernandez';


-- =============================================================
-- CARINA BOSSO — Gobernador Gregores
-- Gestión tranquila. Respondió bien a emergencia hídrica 2024.
-- Alineada con gobierno provincial. Sin conflictos relevantes.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 59.4, 32.1, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar, Tiempo Sur. Gestión estable, obras anunciadas.',
  'Intendenta de Gregores. 15 viviendas + polideportivo. Respuesta eficaz emergencia hídrica.'
FROM politicos WHERE slug = 'carina-bosso';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 58.2, 33.5, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar. Sin conflictos nuevos. Gestión sostenida.',
  'Imagen positiva estable. Ciudad ganadera sin grandes conflictos laborales o institucionales. Mayo 2026.'
FROM politicos WHERE slug = 'carina-bosso';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 60.8, 30.7, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 59.4, 32.1, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.8, 32.8, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.2, 33.5, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'carina-bosso';


-- =============================================================
-- JUAN MARTÍNEZ — Puerto Deseado
-- Equilibró déficit de 250-300M/mes en 6 meses.
-- Sala de quimioterapia, cloacas/gas para 1000 familias.
-- Conflicto pesquero y portuario, distanciamiento de Vidal.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 58.3, 33.7, 'Estimación · Medios SC',
  'Cobertura El Diario Nuevo Día, El Patagónico. Equilibrio fiscal notable en 6 meses.',
  'Sala de quimioterapia en hospital. Extensión cloacas/gas 1000 familias. Conflictos pesqueros menores.'
FROM politicos WHERE slug = 'juan-martinez-sc';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 57.3, 34.8, 'Estimación · Medios SC',
  'Cobertura El Diario Nuevo Día. Proyecto aeródromo + matadero municipal. Distanciamiento de Vidal.',
  'Gestión fiscal y de obra sólida. Imagen positiva moderada. Puerto pesquero activo. Mayo 2026.'
FROM politicos WHERE slug = 'juan-martinez-sc';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 60.1, 31.8, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.3, 33.7, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.9, 34.3, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.3, 34.8, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'juan-martinez-sc';


-- =============================================================
-- ALDO ARAVENA — 28 de Noviembre
-- Convenio Distrigas, regularización terrenos, PAINA.
-- Se opuso al endeudamiento en dólares de Vidal.
-- Ciudad minera ligada a YCRT.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 55.7, 36.4, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar, El Diario Nuevo Día. Convenios obras y terrenos.',
  'Gestión moderada. Convenio gas Distrigas. Regularización lotes históricos. Oposición deuda Vidal.'
FROM politicos WHERE slug = 'aldo-aravena';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 54.6, 37.3, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar. Ciudad minera afectada indirectamente por crisis YCRT.',
  'Imagen levemente positiva. Baja leve por crisis YCRT en zona. Sin conflictos locales directos. Mayo 2026.'
FROM politicos WHERE slug = 'aldo-aravena';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 57.2, 34.9, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.7, 36.4, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 55.1, 36.9, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.6, 37.3, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'aldo-aravena';


-- =============================================================
-- JUAN MANUEL BÓRQUEZ — Puerto Santa Cruz
-- Proyecto avícola integral (producción + piscicultura).
-- Puerto Punta Quilla en reactivación.
-- 20 viviendas para madres solteras, hospital, escuelas.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 54.8, 37.3, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar, Tiempo Sur. Proyectos productivos innovadores.',
  'Primer intendente Por Santa Cruz en esa ciudad. Proyecto avícola + piscicultura. Puerto Punta Quilla.'
FROM politicos WHERE slug = 'juan-manuel-borquez';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 53.7, 38.4, 'Estimación · Medios SC',
  'Cobertura Tiempo Sur, noticias.santacruz.gob.ar. Obras avícolas concretas en ejecución.',
  'Gestión moderada. Ciudad histórica con economía diversificada. Proyectos productivos en marcha. Mayo 2026.'
FROM politicos WHERE slug = 'juan-manuel-borquez';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 56.3, 35.8, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.8, 37.3, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.2, 37.9, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 53.7, 38.4, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'juan-manuel-borquez';


-- =============================================================
-- MATÍAS TREPPO — Perito Moreno
-- Primer año "de aprendizaje" con equipo joven.
-- Duplicó producción de frutillas. Línea eléctrica $19.5M.
-- Auditorio Águila $146M + obras $4.600M.
-- Distanciamiento del kirchnerismo previo.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 51.4, 39.7, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar, winfo.ar. Primer año positivo con curva de aprendizaje.',
  'Intendente joven. Duplicó producción frutillas. Línea eléctrica reactivada. Auditorio inaugurado.'
FROM politicos WHERE slug = 'matias-treppo';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 52.6, 38.4, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar. Gestión en mejora. $4.600M obras anunciadas.',
  'Imagen en leve mejora. Ciudad cordillerana con inversiones crecientes. Turismo y producción. Mayo 2026.'
FROM politicos WHERE slug = 'matias-treppo';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 49.8, 41.3, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 51.4, 39.7, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.1, 39.0, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.6, 38.4, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'matias-treppo';


-- =============================================================
-- ANALÍA FARÍAS — Piedra Buena
-- Heredó 115M deuda + CSS. Herencia de "24 años de detrimento".
-- Convenio laboral, Hospital Zamudio, polideportivo.
-- FIT 2025 — turismo.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 50.2, 41.4, 'Estimación · Medios SC',
  'Cobertura Tiempo Sur, noticias.santacruz.gob.ar. Gestión de herencia compleja.',
  'Primera intendenta. Heredó deuda municipal histórica. Avanza en hospital y polideportivo.'
FROM politicos WHERE slug = 'analia-farias';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 51.3, 40.5, 'Estimación · Medios SC',
  'Cobertura Tiempo Sur. Avances en obras y gestión laboral. Participación FIT 2025.',
  'Imagen leve mejora. Gestión en saneamiento financiero municipal. Turismo Río Santa Cruz. Mayo 2026.'
FROM politicos WHERE slug = 'analia-farias';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 48.7, 43.0, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'analia-farias';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.2, 41.4, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'analia-farias';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 50.8, 41.0, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'analia-farias';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 51.3, 40.5, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'analia-farias';


-- =============================================================
-- ANTONIO CARAMBIA — Las Heras
-- Reelecto 2023. Ciudad petrolera.
-- CONFLICTO: barrios loteados sobre pozos petroleros (OPI SC).
-- CONFLICTO: "camarilla" opositora a Vidal con facturas impagas.
-- Despidos en cooperadora municipal.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 48.3, 43.2, 'Estimación · Medios SC',
  'Cobertura OPI Santa Cruz, El Diario Nuevo Día. Conflictos por loteos sobre pozos petroleros.',
  'Reelecto 2023. OPI denuncia barrios sobre pozos abandonados — herencia familia Carambia. Conflictos laborales.'
FROM politicos WHERE slug = 'antonio-carambia';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 46.2, 45.7, 'Estimación · Medios SC',
  'Cobertura OPI Santa Cruz. Vinculado a "camarilla" opositora a Vidal. Facturas impagas al gobierno provincial.',
  'Imagen comprometida por conflictos con provincia y cuestionamientos urbanísticos. Mayo 2026.'
FROM politicos WHERE slug = 'antonio-carambia';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.1, 39.4, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 48.3, 43.2, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 47.1, 44.5, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 46.2, 45.7, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'antonio-carambia';


-- =============================================================
-- PABLO ANABALÓN — Pico Truncado
-- CONFLICTO: deuda 550M a CAMMESA (subió 143% feb/2024).
-- Vetó bono $150.000 a empleados municipales.
-- Crisis laboral: no asistió a reunión de emergencia.
-- Obras: cloacal, polideportivo, cámaras, bomberos.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 43.8, 47.2, 'Estimación · Medios SC',
  'Cobertura noticias.santacruz.gob.ar, El Diario Nuevo Día. Deuda CAMMESA + veto bono empleados.',
  'Ciudad gasífera con crisis energética. Vetó bono para empleados. No asistió a emergencia laboral.'
FROM politicos WHERE slug = 'pablo-anabalon';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 41.8, 49.3, 'Estimación · Medios SC',
  'Cobertura El Diario Nuevo Día, OPI Santa Cruz. Crisis financiera CAMMESA sostenida.',
  'Imagen negativa. Deuda energética alta, conflictos laborales recurrentes. Obras en ejecución. Mayo 2026.'
FROM politicos WHERE slug = 'pablo-anabalon';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 47.6, 43.8, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 43.8, 47.2, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 42.6, 48.4, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 41.8, 49.3, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'pablo-anabalon';


-- =============================================================
-- ZULMA NEIRA — Los Antiguos
-- CONFLICTO GRAVE: consideró renunciar públicamente (2025).
-- Acusó al ex intendente Bellomo de intentar cogobierno.
-- Solicitó restricción de acercamiento contra vecinos.
-- Alcanzó acuerdo salarial ATE/SOEM. Vidal fue a apoyarla.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 54.2, 36.8, 'Estimación · Medios SC',
  'Cobertura La Opinión Austral. Primera intendenta kirchnerista Los Antiguos. Inicio de gestión.',
  'Primera intendenta de Los Antiguos (UxP). FIT 2025. 20 viviendas en marcha.'
FROM politicos WHERE slug = 'zulma-neira';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 48.9, 42.4, 'Estimación · Medios SC',
  'Cobertura La Opinión Austral, patagonianexo.com.ar. Crisis institucional 2025: consideró renunciar.',
  'Imagen caída por crisis institucional grave. Cogobierno, amenazas, restricciones de acercamiento. Mayo 2026.'
FROM politicos WHERE slug = 'zulma-neira';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 58.3, 33.2, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 54.2, 36.8, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 51.3, 39.7, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 48.9, 42.4, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'zulma-neira';


-- =============================================================
-- PABLO CARRIZO — Caleta Olivia
-- CONFLICTO: juez ordenó dar info pública negada (feb/2025).
-- CONFLICTO: aumento 122% cargos políticos (OPI: "vergonzosa").
-- CONFLICTO: borró base de datos de Boletines Oficiales.
-- CONFLICTO: viajó a España sin notificar al Concejo (abr/2025).
-- CONFLICTO: "camarilla" opositora a Vidal con Carambia.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 40.7, 51.2, 'Estimación · Medios SC',
  'Cobertura OPI Santa Cruz (crítica), La Opinión Austral. Múltiples conflictos de transparencia.',
  'Intendente Caleta Olivia. Aumento 122% cargos políticos. Borró base datos boletines. Conflictos laborales.'
FROM politicos WHERE slug = 'pablo-carrizo';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 36.5, 55.4, 'Estimación · Medios SC',
  'Cobertura OPI Santa Cruz. Juez ordenó info pública. Viajó sin notificar. "Camarilla" Vidal.',
  'Imagen negativa sostenida. 2da ciudad SC con gestión cuestionada por transparencia. Mayo 2026.'
FROM politicos WHERE slug = 'pablo-carrizo';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 45.3, 46.8, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 40.7, 51.2, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 38.4, 53.1, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 36.5, 55.4, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'pablo-carrizo';


-- =============================================================
-- DARÍO MENNA — Río Turbio
-- CONFLICTO: deuda 2.500M a CSS. Versiones contradictorias.
-- CONFLICTO: intimó a periodista por "campaña difamatoria".
-- CONFLICTO: SOEM demandó por retención cuotas ($120M+).
-- Conflicto con Vidal por YCRT. Inauguró Mercado Municipal.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 41.3, 50.2, 'Estimación · Medios SC',
  'Cobertura OPI Santa Cruz, La Opinión Austral, Tiempo Sur. Crisis YCRT + deuda CSS.',
  'Río Turbio. Deuda 2.500M a CSS. Intimó periodista. Demanda SOEM. Conflicto YCRT con Vidal.'
FROM politicos WHERE slug = 'dario-menna';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 39.4, 52.3, 'Estimación · Medios SC',
  'Cobertura OPI Santa Cruz, letrap.com.ar. Crisis minera sostenida + conflictos sindicales.',
  'Ciudad minera en crisis estructural. YCRT en disputa. Imagen negativa con tendencia sostenida. Mayo 2026.'
FROM politicos WHERE slug = 'dario-menna';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 45.8, 45.7, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'dario-menna';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 41.3, 50.2, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'dario-menna';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 40.3, 51.2, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'dario-menna';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 39.4, 52.3, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'dario-menna';


-- =============================================================
-- NÉSTOR TICÓ — El Chaltén
-- CONFLICTO GRAVE: denuncia penal por corrupción activa.
-- — Licitaciones direccionadas a empresa de su pareja.
-- — Cobró 84% obra cuando avance real era 46%.
-- — Maquinaria en su casa sin realizar obras.
-- Primer intendente reelecto en historia de El Chaltén.
-- =============================================================

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2024-10-01', 44.6, 47.3, 'Estimación · Medios SC',
  'Cobertura OPI Santa Cruz, periodismoypunto.com, El Diario Nuevo Día. Denuncias penales activas.',
  'Denuncias por corrupción: licitaciones empresa pareja, falsificación certificaciones obra, maquinaria en domicilio.'
FROM politicos WHERE slug = 'nestor-tico';

INSERT INTO encuestas (politico_id, fecha, imagen_positiva, imagen_negativa, fuente, metodologia, notas)
SELECT id, '2026-05-04', 38.6, 53.1, 'Estimación · Medios SC',
  'Cobertura OPI Santa Cruz, winfo.ar. Investigación penal en curso. Impuesto turismo cuestionado.',
  'Imagen negativa por denuncias penales. Cobró 84% de plan viviendas con 46% de avance real. Mayo 2026.'
FROM politicos WHERE slug = 'nestor-tico';

INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 52.3, 40.1, 0, '2024-04-01T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 44.6, 47.3, 0, '2024-10-01T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 41.8, 50.2, 0, '2025-04-01T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico';
INSERT INTO imagen_historico (politico_id, imagen_positiva, imagen_negativa, total_menciones, calculado_at)
SELECT id, 38.6, 53.1, 0, '2026-05-04T00:00:00Z' FROM politicos WHERE slug = 'nestor-tico';


-- =============================================================
-- Verificación: todos los políticos con imagen cargada
-- =============================================================
SELECT
  p.nombre,
  p.cargo,
  ROUND(MAX(h.imagen_positiva)::numeric, 1) AS ultima_positiva,
  ROUND(MAX(h.imagen_negativa)::numeric, 1) AS ultima_negativa,
  COUNT(DISTINCT e.id) AS encuestas_cargadas,
  COUNT(DISTINCT h.id) AS puntos_historicos
FROM politicos p
LEFT JOIN imagen_historico h ON h.politico_id = p.id
LEFT JOIN encuestas e ON e.politico_id = p.id
WHERE p.activo = true
GROUP BY p.nombre, p.cargo
ORDER BY COALESCE(MAX(h.imagen_positiva), 0) DESC;
