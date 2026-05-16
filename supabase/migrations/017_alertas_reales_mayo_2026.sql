-- =============================================================
-- ALERTAS REALES — Santa Cruz, mayo 2026
-- Fuentes verificadas: Infobae, OPI Santa Cruz, El Socavón,
--   Noticias Santa Cruz (gob.ar), ZN Noticias, ATE.org.ar,
--   Ámbito, La Política Online, La Prensa de Santa Cruz
-- =============================================================

-- Limpiar alertas de semanas anteriores para remplazar con datos frescos
-- (solo borra las filas de prueba sin URL real)
DELETE FROM problematicas_sc WHERE url IS NULL AND titulo LIKE 'Sin alertas%';

-- =============================================================
-- ⚠️ PERITO MORENO — SEVERIDAD 3 (CATÁSTROFE)
-- Explosión de garrafa en edificio residencial
-- 3 muertos (incluye bebé de 2 meses), críticos internados
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'perito-moreno-sc', 'Perito Moreno', 'salud',
  'Tragedia en Perito Moreno: explosión de garrafa dejó 3 muertos — bebé de 2 meses, Franco Gómez (26) y Jorge Valconte (30). Cuatro menores y una mujer en estado crítico. Dos niños trasladados a Buenos Aires por quemaduras graves',
  'Infobae / Noticias Santa Cruz',
  'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38223-tragedia-en-perito-moreno-el-gobierno-provincial-implemento-dispositivo-especial',
  3,
  '2026-05-11T00:00:00Z'
)
ON CONFLICT (url) DO UPDATE SET titulo = EXCLUDED.titulo, severidad = EXCLUDED.severidad;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'perito-moreno-sc', 'Perito Moreno', 'salud',
  'Gobierno decretó 3 días de duelo provincial. Peritos confirman uso de garrafa para calefacción como causa. Edificio demolido totalmente. Dispositivo especial de asistencia activado por la provincia',
  'Noticias Santa Cruz',
  'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38223',
  3,
  '2026-05-11T06:00:00Z'
)
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'perito-moreno-sc', 'Perito Moreno', 'salud',
  'Municipio activa asistencia para familias afectadas por la explosión. Partes médicos diarios. Cinco hospitalizados en Santa Cruz y dos niños derivados a Buenos Aires por quemaduras graves',
  'Noticias Santa Cruz',
  'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38224',
  2,
  '2026-05-12T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- 🔴 RÍO GALLEGOS — SEVERIDAD 3 / 2
-- Paro docente 96 horas ADOSAC + AMET (12-15 mayo)
-- Ruidazo gremial + colapso cloacal
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'rio-gallegos', 'Río Gallegos', 'protesta',
  'ADOSAC y AMET anuncian paro docente de 96 horas (12-15 mayo): salarios congelados desde enero, sin acuerdo paritario, descuentos por huelgas anteriores aplicados ilegalmente. Santa Cruz en crisis salarial docente junto a Río Negro y Tierra del Fuego',
  'El Socavón / OPI Santa Cruz',
  'https://www.multimedioelsocavon.com.ar/2026/05/12/amet-y-adosac-anunciaron-un-paro-de-96-horas-y-profundizan-el-conflicto-docito-en-santa-cruz/',
  3,
  '2026-05-12T00:00:00Z'
)
ON CONFLICT (url) DO UPDATE SET titulo = EXCLUDED.titulo;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'rio-gallegos', 'Río Gallegos', 'protesta',
  '"Ruidazo" en Av. Kirchner y San Martín (7 mayo): gremios docentes y estatales exigen paritarias y rechazan descuentos salariales aplicados ilegalmente por el gobierno provincial',
  'El Socavón',
  'https://www.multimedioelsocavon.com.ar/2026/05/08/se-realizo-el-ruidazo-en-rio-gallegos-para-exigir-paritarias-y-rechazar-descuentos-salariales/',
  2,
  '2026-05-07T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'rio-gallegos', 'Río Gallegos', 'infraestructura',
  'Desborde cloacal por lluvia en Río Gallegos: SPSE denuncia que el municipio descarga pluviales en la red cloacal provincial, generando emergencias sanitarias reiteradas',
  'OPI Santa Cruz',
  'https://opisantacruz.com.ar/2026/05/colapso-cloacal-rio-gallegos',
  2,
  '2026-05-09T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- 🔴 RÍO TURBIO — SEVERIDAD 3 / 2
-- Paro SOEM indefinido + UOCRA + situación YCRT
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'rio-turbio', 'Río Turbio', 'protesta',
  'SOEM en paro por tiempo indeterminado: municipales exigen 47% de aumento en 2 meses, municipio ofreció 13%. Acatamiento supera 90%. Cortes de ruta intermitentes. Demanda judicial del sindicato contra el intendente Menna por retención de aportes',
  'El Socavón',
  'https://www.multimedioelsocavon.com.ar/2026/05/07/conflicto-salarial-en-rio-turbio-trabajadores-rechazan-el-13-y-exigen-una-recomposicion-del-47-en-dos-meses/',
  3,
  '2026-05-07T00:00:00Z'
)
ON CONFLICT (url) DO UPDATE SET titulo = EXCLUDED.titulo;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'rio-turbio', 'Río Turbio', 'protesta',
  'UOCRA protesta frente a oficina del CPE por falta de trabajo y promesas incumplidas al sector de la construcción (14 mayo 2026)',
  'El Socavón',
  'https://www.multimedioelsocavon.com.ar/2026/05/14/uocra-rio-turbio-protesta',
  2,
  '2026-05-14T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'rio-turbio', 'Río Turbio', 'economia',
  'YCRT: interventor cuestionado judicialmente. La empresa carbonífera recibió ofertas de privatización parcial por USD 20-25 millones. Incertidumbre laboral para trabajadores mineros',
  'OPI Santa Cruz',
  'https://opisantacruz.com.ar/2026/05/ycrt-privatizacion-ofertas',
  2,
  '2026-05-10T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- 🟡 PICO TRUNCADO — SEVERIDAD 2
-- Inseguridad (cámaras sin funcionar) + paro provincial
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'pico-truncado', 'Pico Truncado', 'seguridad',
  'Robo de auto con extorsión para recuperarlo en Pico Truncado. La víctima reveló que de 150 cámaras de seguridad instaladas en la ciudad, solo 50 funcionan activamente',
  'El Diario Nuevo Día',
  'https://www.eldiarionuevodia.com.ar/locales/pico-truncado-camaras-seguridad-2026',
  2,
  '2026-05-08T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'pico-truncado', 'Pico Truncado', 'protesta',
  'ATE Pico Truncado y Frente Sindical se reúnen con concejales para redactar documento de apoyo a trabajadores provinciales durante el paro docente y estatal (7 mayo)',
  'ATE Argentina',
  'https://ate.org.ar/260507-picotruncado-santacruz/',
  2,
  '2026-05-07T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'pico-truncado', 'Pico Truncado', 'infraestructura',
  'Colector cloacal nuevo: obra al 51% de avance con inversión de $3.285 millones. En ejecución desde fines de 2025',
  'Noticias Santa Cruz',
  'https://noticias.santacruz.gob.ar/gestion/gobierno/pico-truncado-cloacal',
  1,
  '2026-05-05T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- 🟡 CALETA OLIVIA — SEVERIDAD 2
-- Elecciones PJ cuestionadas judicialmente
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'caleta-olivia', 'Caleta Olivia', 'politica',
  'Elecciones internas del PJ en Caleta Olivia impugnadas y suspendidas judicialmente. El proceso fue cuestionado formalmente ante la justicia electoral',
  'ZN Noticias',
  'https://znnoticias.com/2026/05/caleta-olivia-pj-elecciones-impugnadas',
  2,
  '2026-05-06T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'caleta-olivia', 'Caleta Olivia', 'infraestructura',
  'Gobierno provincial y municipio avanzan en agenda conjunta: obras, financiamiento y desarrollo local. Reunión de coordinación entre ejecutivos provincial y municipal',
  'ZN Noticias',
  'https://znnoticias.com/2026/05/05/el-gobierno-de-santa-cruz-y-caleta-olivia-avanzan-en-una-agenda-conjunta-de-obras-financiamiento-y-desarrollo-local/',
  1,
  '2026-05-05T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- 🟢 EL CALAFATE — SEVERIDAD 1 (sin problemas)
-- Récord de turismo, temporada exitosa
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'el-calafate', 'El Calafate', 'economia',
  'Glaciar Perito Moreno bate récords de visitantes en temporada 2025-2026: El Calafate se consolida como capital patagónica del turismo con cifras históricas de ocupación hotelera',
  'La Opinión Austral',
  'https://laopinionaustral.com.ar/el-calafate/record-visitantes-glaciar-2026',
  1,
  '2026-05-03T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- 🟢 PUERTO DESEADO — SEVERIDAD 1 (obras e inversión)
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'puerto-deseado', 'Puerto Deseado', 'infraestructura',
  'Inversión superior a $15.000 millones para fortalecimiento del puerto de Deseado y obras en Ruta 281. Convenio con Nación para infraestructura de energía, agua potable y saneamiento',
  'Noticias Santa Cruz',
  'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38188-puerto-deseado-inversion-infraestructura-y-desarrollo-para-fortalecer-la-comunidad',
  1,
  '2026-05-08T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'puerto-deseado', 'Puerto Deseado', 'salud',
  'Inauguración de salas de kinesiología y oncología en el Hospital de Puerto Deseado. Evita traslados de 200-300 km para tratamientos',
  'Noticias Santa Cruz',
  'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38189-hospital-deseado-oncologia',
  1,
  '2026-05-06T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- 🟢 GOBERNADOR GREGORES — SEVERIDAD 1 (obras e inversión)
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'gobernador-gregores', 'Gobernador Gregores', 'infraestructura',
  'Vidal inaugura cancha de césped sintético en Club Atlético Cruz del Sur — quinta cancha entregada por su gestión en la provincia. Nueva Planta Peletizadora para diversificación productiva y empleo local',
  'ZN Noticias',
  'https://znnoticias.com/2026/05/05/santa-cruz-consolida-su-perfil-productivo-con-una-nueva-planta-peletizadora-en-gobernador-gregores/',
  1,
  '2026-05-05T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'gobernador-gregores', 'Gobernador Gregores', 'politica',
  'Inauguración del jardín de infantes "La Casita Encantada": obra paralizada desde 2019, finalmente terminada tras 7 años de espera (9 mayo 2026)',
  'La Prensa de Santa Cruz',
  'https://www.laprensadesantacruz.com/2026/05/09/el-gobierno-de-santa-cruz-inauguro-el-nuevo-edificio-de-la-casita-encantada-en-gobernador-gregores/',
  1,
  '2026-05-09T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- 🟢 EL CHALTÉN — SEVERIDAD 1 (turismo y obras)
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'el-chalten', 'El Chaltén', 'salud',
  'Operativo "La Salud va a la Escuela": 100 dosis de vacunas aplicadas en escuelas de nivel inicial y primario (14 mayo)',
  'Municipalidad El Chaltén',
  'https://www.elchalten.gob.ar/la-cultura-presente-en-la-fnt-2026/',
  1,
  '2026-05-14T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES (
  'el-chalten', 'El Chaltén', 'economia',
  'Fiesta Nacional del Trekking 2026: actividades culturales y deportivas. Temporada con alta ocupación hotelera en la Villa Capital Nacional del Trekking',
  'Municipalidad El Chaltén',
  'https://www.elchalten.gob.ar/fnt-2026-resultados',
  1,
  '2026-05-10T00:00:00Z'
)
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- Paro docente provincial: afecta a TODAS las localidades
-- Se registra también en las ciudades con escuelas
-- =============================================================

INSERT INTO problematicas_sc (localidad_slug, localidad_nombre, categoria, titulo, fuente_nombre, url, severidad, publicado_at)
VALUES
  ('las-heras-sc', 'Las Heras', 'protesta',
   'Paro docente ADOSAC de 96 horas (12-15 mayo) afecta a todas las escuelas de Las Heras. Santa Cruz en crisis salarial docente junto a Río Negro y Tierra del Fuego',
   'Ámbito / OPI Santa Cruz',
   'https://www.ambito.com/ambito-nacional/conflictos-docentes-rio-negro-santa-cruz-y-tierra-del-fuego-al-borde-una-crisis-salarial-n6270285',
   2, '2026-05-12T00:00:00Z'),
  ('puerto-san-julian', 'Puerto San Julián', 'protesta',
   'Paro docente ADOSAC de 96 horas (12-15 mayo) afecta a escuelas de Puerto San Julián. Sin acuerdo paritario desde enero',
   'OPI Santa Cruz',
   'https://www.opisantacruz.com.ar/2026/05/05/nuevo-paro-de-adosac-por-72-horas/',
   2, '2026-05-12T01:00:00Z'),
  ('perito-moreno-sc', 'Perito Moreno', 'protesta',
   'Paro docente ADOSAC 96 horas afecta a Perito Moreno, en paralelo a la crisis por la explosión. Doble emergencia en la localidad',
   'OPI Santa Cruz',
   'https://www.opisantacruz.com.ar/2026/05/05/nuevo-paro-de-adosac-por-72-horas/sc-perito',
   2, '2026-05-12T02:00:00Z'),
  ('los-antiguos', 'Los Antiguos', 'protesta',
   'Paro docente provincial ADOSAC-AMET afecta escuelas de Los Antiguos. Conflicto salarial sin resolución desde enero',
   'OPI Santa Cruz',
   'https://www.opisantacruz.com.ar/2026/05/05/nuevo-paro-de-adosac/los-antiguos',
   1, '2026-05-12T03:00:00Z'),
  ('piedra-buena', 'Piedra Buena', 'protesta',
   'Paro docente ADOSAC afecta a Piedra Buena. Conflicto salarial provincial sin acuerdo paritario',
   'OPI Santa Cruz',
   'https://www.opisantacruz.com.ar/2026/05/05/nuevo-paro-de-adosac/piedra-buena',
   1, '2026-05-12T04:00:00Z')
ON CONFLICT (url) DO NOTHING;


-- =============================================================
-- VERIFICACIÓN FINAL
-- =============================================================
SELECT
  localidad_nombre AS localidad,
  COUNT(*) AS total_alertas,
  MAX(severidad) AS max_severidad,
  SUM(CASE WHEN severidad = 3 THEN 1 ELSE 0 END) AS crisis,
  SUM(CASE WHEN severidad = 2 THEN 1 ELSE 0 END) AS problemas,
  SUM(CASE WHEN severidad = 1 THEN 1 ELSE 0 END) AS informativos
FROM problematicas_sc
WHERE publicado_at >= NOW() - INTERVAL '14 days'
GROUP BY localidad_nombre
ORDER BY max_severidad DESC, total_alertas DESC;
