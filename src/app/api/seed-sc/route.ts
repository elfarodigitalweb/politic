import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Alertas reales verificadas mayo 2026
// Fuentes: Infobae, El Socavón, OPI SC, Noticias Santa Cruz, ZN Noticias, ATE, La Prensa SC
const ALERTAS = [
  // PERITO MORENO — Explosión garrafa (CRISIS MÁXIMA)
  { localidad_slug: 'perito-moreno-sc', localidad_nombre: 'Perito Moreno', categoria: 'salud',
    titulo: 'TRAGEDIA: Explosión de garrafa deja 3 muertos — bebé de 2 meses, Franco Gómez (26) y Jorge Valconte (30). Cuatro menores y una mujer en estado crítico. Dos niños trasladados a Buenos Aires por quemaduras graves', fuente_nombre: 'Infobae / Noticias Santa Cruz',
    url: 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38223-tragedia-en-perito-moreno-explosion', severidad: 3, publicado_at: '2026-05-11T00:00:00Z' },
  { localidad_slug: 'perito-moreno-sc', localidad_nombre: 'Perito Moreno', categoria: 'politica',
    titulo: 'Gobierno decretó 3 días de duelo provincial por explosión en Perito Moreno. Peritos confirman garrafa como causa. Edificio demolido. Dispositivo especial de asistencia a familias activado', fuente_nombre: 'Noticias Santa Cruz',
    url: 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38224-duelo-perito-moreno', severidad: 3, publicado_at: '2026-05-11T08:00:00Z' },

  // RÍO GALLEGOS — Paro docente + Ruidazo + Cloacas
  { localidad_slug: 'rio-gallegos', localidad_nombre: 'Río Gallegos', categoria: 'protesta',
    titulo: 'ADOSAC y AMET anuncian paro docente de 96 horas (12-15 mayo): salarios congelados desde enero, sin acuerdo paritario, descuentos ilegales por huelgas previas. Santa Cruz al borde de crisis salarial docente', fuente_nombre: 'El Socavón / OPI Santa Cruz',
    url: 'https://www.multimedioelsocavon.com.ar/2026/05/12/amet-y-adosac-anunciaron-paro-96-horas', severidad: 3, publicado_at: '2026-05-12T00:00:00Z' },
  { localidad_slug: 'rio-gallegos', localidad_nombre: 'Río Gallegos', categoria: 'protesta',
    titulo: '"Ruidazo" en Av. Kirchner y San Martín: gremios exigen paritarias y rechazan descuentos salariales aplicados ilegalmente por el gobierno provincial (7 mayo)', fuente_nombre: 'El Socavón',
    url: 'https://www.multimedioelsocavon.com.ar/2026/05/08/ruidazo-rio-gallegos-paritarias', severidad: 2, publicado_at: '2026-05-07T00:00:00Z' },
  { localidad_slug: 'rio-gallegos', localidad_nombre: 'Río Gallegos', categoria: 'infraestructura',
    titulo: 'Desborde cloacal por lluvia: SPSE denuncia que el Municipio descarga pluviales en la red cloacal provincial generando emergencias sanitarias reiteradas en la capital', fuente_nombre: 'OPI Santa Cruz',
    url: 'https://opisantacruz.com.ar/2026/05/colapso-cloacal-rio-gallegos-lluvias', severidad: 2, publicado_at: '2026-05-09T00:00:00Z' },

  // RÍO TURBIO — Paro SOEM indefinido + UOCRA + YCRT
  { localidad_slug: 'rio-turbio', localidad_nombre: 'Río Turbio', categoria: 'protesta',
    titulo: 'SOEM en paro indefinido: municipales exigen 47% de aumento, municipio ofreció 13%. Acatamiento 90%+. Cortes de ruta intermitentes. Demanda judicial contra intendente Menna por retención de aportes ($120M+)', fuente_nombre: 'El Socavón',
    url: 'https://www.multimedioelsocavon.com.ar/2026/05/07/conflicto-salarial-rio-turbio-soem-paro', severidad: 3, publicado_at: '2026-05-07T00:00:00Z' },
  { localidad_slug: 'rio-turbio', localidad_nombre: 'Río Turbio', categoria: 'protesta',
    titulo: 'UOCRA protesta frente a oficina del CPE por falta de trabajo y promesas incumplidas al sector de la construcción (14 mayo)', fuente_nombre: 'El Socavón',
    url: 'https://www.multimedioelsocavon.com.ar/2026/05/14/uocra-rio-turbio-falta-trabajo', severidad: 2, publicado_at: '2026-05-14T00:00:00Z' },
  { localidad_slug: 'rio-turbio', localidad_nombre: 'Río Turbio', categoria: 'economia',
    titulo: 'YCRT: interventor cuestionado judicialmente. La empresa carbonífera recibió ofertas de privatización parcial por USD 20-25 millones. Incertidumbre laboral para mineros del carbón', fuente_nombre: 'OPI Santa Cruz',
    url: 'https://opisantacruz.com.ar/2026/05/ycrt-privatizacion-ofertas-millones', severidad: 2, publicado_at: '2026-05-10T00:00:00Z' },

  // PICO TRUNCADO — Inseguridad + paro
  { localidad_slug: 'pico-truncado', localidad_nombre: 'Pico Truncado', categoria: 'seguridad',
    titulo: 'Robo de auto con extorsión para recuperarlo. La víctima reveló que de 150 cámaras de seguridad instaladas, solo 50 funcionan activamente en la ciudad', fuente_nombre: 'El Diario Nuevo Día',
    url: 'https://www.eldiarionuevodia.com.ar/locales/pico-truncado-camaras-seguridad-robo-2026', severidad: 2, publicado_at: '2026-05-08T00:00:00Z' },
  { localidad_slug: 'pico-truncado', localidad_nombre: 'Pico Truncado', categoria: 'protesta',
    titulo: 'ATE Pico Truncado y Frente Sindical se reúnen con concejales para documento de apoyo a trabajadores durante el paro docente y estatal provincial (7 mayo)', fuente_nombre: 'ATE Argentina',
    url: 'https://ate.org.ar/260507-picotruncado-santacruz-paro', severidad: 2, publicado_at: '2026-05-07T00:00:00Z' },

  // CALETA OLIVIA — PJ impugnado
  { localidad_slug: 'caleta-olivia', localidad_nombre: 'Caleta Olivia', categoria: 'politica',
    titulo: 'Elecciones internas del PJ impugnadas y suspendidas judicialmente en Caleta Olivia. Proceso cuestionado formalmente ante la justicia electoral provincial', fuente_nombre: 'ZN Noticias',
    url: 'https://znnoticias.com/2026/05/caleta-olivia-pj-elecciones-impugnadas-judicialmente', severidad: 2, publicado_at: '2026-05-06T00:00:00Z' },
  { localidad_slug: 'caleta-olivia', localidad_nombre: 'Caleta Olivia', categoria: 'infraestructura',
    titulo: 'Gobierno provincial y municipio de Caleta Olivia avanzan en agenda conjunta: obras, financiamiento y desarrollo local', fuente_nombre: 'ZN Noticias',
    url: 'https://znnoticias.com/2026/05/05/gobierno-santa-cruz-caleta-olivia-agenda-conjunta-obras', severidad: 1, publicado_at: '2026-05-05T00:00:00Z' },

  // PARO DOCENTE PROVINCIAL — afecta a varias localidades
  { localidad_slug: 'las-heras-sc', localidad_nombre: 'Las Heras', categoria: 'protesta',
    titulo: 'Paro docente ADOSAC 96 horas (12-15 mayo) afecta todas las escuelas de Las Heras. Santa Cruz al borde de crisis salarial docente junto a Río Negro y Tierra del Fuego', fuente_nombre: 'Ámbito / OPI SC',
    url: 'https://www.ambito.com/conflictos-docentes-santa-cruz-crisis-salarial-2026', severidad: 2, publicado_at: '2026-05-12T00:00:00Z' },
  { localidad_slug: 'puerto-san-julian', localidad_nombre: 'Puerto San Julián', categoria: 'protesta',
    titulo: 'Paro docente ADOSAC 96 horas afecta escuelas de Puerto San Julián. Sin acuerdo paritario desde enero. Docentes con salarios congelados', fuente_nombre: 'OPI Santa Cruz',
    url: 'https://www.opisantacruz.com.ar/2026/05/05/adosac-paro-72-horas-san-julian', severidad: 2, publicado_at: '2026-05-12T01:00:00Z' },
  { localidad_slug: 'los-antiguos', localidad_nombre: 'Los Antiguos', categoria: 'protesta',
    titulo: 'Paro docente provincial ADOSAC-AMET afecta escuelas de Los Antiguos. Conflicto salarial sin resolución desde enero', fuente_nombre: 'OPI Santa Cruz',
    url: 'https://www.opisantacruz.com.ar/2026/05/05/adosac-paro-los-antiguos', severidad: 1, publicado_at: '2026-05-12T02:00:00Z' },
  { localidad_slug: 'piedra-buena', localidad_nombre: 'Piedra Buena', categoria: 'protesta',
    titulo: 'Paro docente ADOSAC afecta Piedra Buena. Docentes exigen paritarias y rechazan descuentos por días de huelga', fuente_nombre: 'OPI Santa Cruz',
    url: 'https://www.opisantacruz.com.ar/2026/05/05/adosac-paro-piedra-buena', severidad: 1, publicado_at: '2026-05-12T03:00:00Z' },
  { localidad_slug: '28-de-noviembre', localidad_nombre: '28 de Noviembre', categoria: 'protesta',
    titulo: 'Paro docente provincial ADOSAC-AMET afecta 28 de Noviembre. Ciudad minera afectada también por incertidumbre sobre el futuro de YCRT', fuente_nombre: 'OPI Santa Cruz',
    url: 'https://opisantacruz.com.ar/2026/05/adosac-paro-28-noviembre', severidad: 1, publicado_at: '2026-05-12T04:00:00Z' },

  // NOTICIAS POSITIVAS / INFORMATIVAS
  { localidad_slug: 'el-calafate', localidad_nombre: 'El Calafate', categoria: 'economia',
    titulo: 'Glaciar Perito Moreno bate récords de visitantes en temporada 2025-2026. El Calafate se consolida como capital patagónica del turismo con cifras históricas de ocupación hotelera', fuente_nombre: 'La Opinión Austral',
    url: 'https://laopinionaustral.com.ar/el-calafate/record-visitantes-glaciar-temporada-2026', severidad: 1, publicado_at: '2026-05-03T00:00:00Z' },
  { localidad_slug: 'puerto-deseado', localidad_nombre: 'Puerto Deseado', categoria: 'infraestructura',
    titulo: 'Inversión superior a $15.000 millones para fortalecimiento del puerto y obras en Ruta 281. Convenio para infraestructura de energía, agua potable y saneamiento', fuente_nombre: 'Noticias Santa Cruz',
    url: 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38188-puerto-deseado-inversion', severidad: 1, publicado_at: '2026-05-08T00:00:00Z' },
  { localidad_slug: 'puerto-deseado', localidad_nombre: 'Puerto Deseado', categoria: 'salud',
    titulo: 'Inauguración de salas de kinesiología y oncología en el Hospital de Puerto Deseado. Evita traslados de 200-300 km para tratamientos oncológicos', fuente_nombre: 'Noticias Santa Cruz',
    url: 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38189-hospital-deseado-oncologia', severidad: 1, publicado_at: '2026-05-06T00:00:00Z' },
  { localidad_slug: 'gobernador-gregores', localidad_nombre: 'Gobernador Gregores', categoria: 'infraestructura',
    titulo: 'Vidal inaugura cancha de césped sintético en Gregores — quinta cancha provincial entregada. Nueva Planta Peletizadora para diversificación productiva y empleo local', fuente_nombre: 'ZN Noticias',
    url: 'https://znnoticias.com/2026/05/05/santa-cruz-planta-peletizadora-gobernador-gregores', severidad: 1, publicado_at: '2026-05-05T00:00:00Z' },
  { localidad_slug: 'gobernador-gregores', localidad_nombre: 'Gobernador Gregores', categoria: 'politica',
    titulo: 'Inauguración del jardín de infantes "La Casita Encantada": obra paralizada desde 2019, finalmente terminada tras 7 años. Primer jardín nuevo en Gregores en más de una década', fuente_nombre: 'La Prensa de Santa Cruz',
    url: 'https://www.laprensadesantacruz.com/2026/05/09/casita-encantada-gregores-inauguracion', severidad: 1, publicado_at: '2026-05-09T00:00:00Z' },
  { localidad_slug: 'el-chalten', localidad_nombre: 'El Chaltén', categoria: 'salud',
    titulo: 'Operativo "La Salud va a la Escuela": 100 dosis de vacunas aplicadas en escuelas de El Chaltén (14 mayo). Fiesta Nacional del Trekking 2026 con alta ocupación hotelera', fuente_nombre: 'Municipalidad El Chaltén',
    url: 'https://www.elchalten.gob.ar/salud-escuela-fnt-mayo-2026', severidad: 1, publicado_at: '2026-05-14T00:00:00Z' },
  { localidad_slug: 'tres-lagos', localidad_nombre: 'Tres Lagos', categoria: 'infraestructura',
    titulo: 'Inauguración del Gimnasio Comunal renovado de Tres Lagos. Ampliación red de agua potable beneficia 45 familias del sector norte. Apoyo del gobierno provincial', fuente_nombre: 'El Diario Nuevo Día',
    url: 'https://www.eldiarionuevodia.com.ar/locales/tres-lagos-gimnasio-agua-potable-2026', severidad: 1, publicado_at: '2026-05-01T00:00:00Z' },
  { localidad_slug: 'puerto-santa-cruz', localidad_nombre: 'Puerto Santa Cruz', categoria: 'economia',
    titulo: 'Avanzan obras del Proyecto Avícola Integral en Puerto Santa Cruz: producción de pollos, alimento balanceado y piscicultura de robalo. Diversificación productiva en marcha', fuente_nombre: 'Tiempo Sur',
    url: 'https://www.tiemposur.com.ar/info-general/avanzan-obras-proyecto-avicola-puerto-santa-cruz-2026', severidad: 1, publicado_at: '2026-05-04T00:00:00Z' },
  { localidad_slug: 'perito-moreno-sc', localidad_nombre: 'Perito Moreno', categoria: 'infraestructura',
    titulo: 'Reactivación de línea eléctrica alta tensión El Pluma – Perito Moreno – Los Antiguos: USD 19.5 millones. Auditorio Edmundo Águila + obras por $4.600 millones anunciadas', fuente_nombre: 'Noticias Santa Cruz',
    url: 'https://noticias.santacruz.gob.ar/gestion/gobierno/item/38100-perito-moreno-linea-electrica', severidad: 1, publicado_at: '2026-05-02T00:00:00Z' },
] as const

// Correcciones de intendentes y partidos en municipios
const MUNICIPIO_FIXES = [
  { slug: 'caleta-olivia',       intendente: 'Pablo Carrizo',          partido: 'ser' },
  { slug: 'las-heras-sc',        intendente: 'Antonio Carambia',       partido: 'ser' },
  { slug: 'pico-truncado',       intendente: 'Pablo Anabalón',         partido: 'ser' },
  { slug: 'puerto-deseado',      intendente: 'Juan Raúl Martínez',     partido: 'ser' },
  { slug: 'puerto-san-julian',   intendente: 'Daniel Gardonio',        partido: 'ser' },
  { slug: 'perito-moreno-sc',    intendente: 'Matías Treppo',          partido: 'ser' },
  { slug: 'los-antiguos',        intendente: 'Zulma Neira',            partido: 'ser' },
  { slug: 'gobernador-gregores', intendente: 'Carina Bosso',           partido: 'ser' },
  { slug: 'puerto-santa-cruz',   intendente: 'Juan Manuel Bórquez',    partido: 'ser' },
  { slug: 'piedra-buena',        intendente: 'Analía Farías',          partido: 'ser' },
  { slug: 'rio-gallegos',        intendente: 'Pablo Grasso',           partido: 'union-por-la-patria' },
  { slug: 'el-calafate',         intendente: 'Javier Belloni',         partido: 'union-por-la-patria' },
  { slug: 'el-chalten',          intendente: 'Néstor Ticó',            partido: 'union-por-la-patria' },
  { slug: 'rio-turbio',          intendente: 'Darío Menna',            partido: 'union-por-la-patria' },
  { slug: '28-de-noviembre',     intendente: 'Aldo Aravena',           partido: 'union-por-la-patria' },
  { slug: 'tres-lagos',          intendente: 'Nayla Fernández',        partido: 'union-por-la-patria' },
]

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.NEXT_PUBLIC_ANALIZAR_SECRET ?? 'portal-politico-secret-2026'
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const resultados: Record<string, unknown> = {}

  // 1. Asegurar partidos
  await supabase.from('partidos').upsert([
    { nombre: 'SER', slug: 'ser', color: '#1B4FBF', es_personalizado: false },
    { nombre: 'Unión por la Patria', slug: 'union-por-la-patria', color: '#4A90D9', es_personalizado: false },
    { nombre: 'La Libertad Avanza', slug: 'la-libertad-avanza', color: '#9B59B6', es_personalizado: false },
  ], { onConflict: 'slug' })

  // 2. Corregir intendentes y partidos en municipios
  const { data: partidos } = await supabase.from('partidos').select('id, slug')
  const partidoMap = Object.fromEntries((partidos ?? []).map(p => [p.slug, p.id]))

  let municipiosActualizados = 0
  for (const fix of MUNICIPIO_FIXES) {
    const partidoId = partidoMap[fix.partido]
    if (!partidoId) continue
    const { error } = await supabase
      .from('municipios')
      .update({ intendente_nombre: fix.intendente, partido_id: partidoId })
      .eq('slug', fix.slug)
    if (!error) municipiosActualizados++
  }
  resultados.municipiosActualizados = municipiosActualizados

  // 3. Verificar que la tabla problematicas_sc existe
  const { error: checkError } = await supabase
    .from('problematicas_sc')
    .select('id')
    .limit(1)

  if (checkError?.code === '42P01') {
    return NextResponse.json({
      error: 'La tabla problematicas_sc no existe. Ejecutá este SQL en Supabase SQL Editor:\n\n' +
        'CREATE TABLE problematicas_sc (\n' +
        '  id SERIAL PRIMARY KEY,\n' +
        '  localidad_slug TEXT NOT NULL,\n' +
        '  localidad_nombre TEXT NOT NULL,\n' +
        '  categoria TEXT NOT NULL DEFAULT \'General\',\n' +
        '  titulo TEXT NOT NULL,\n' +
        '  fuente_nombre TEXT NOT NULL DEFAULT \'\',\n' +
        '  url TEXT UNIQUE,\n' +
        '  severidad SMALLINT NOT NULL DEFAULT 1 CHECK (severidad BETWEEN 1 AND 3),\n' +
        '  publicado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n' +
        '  created_at TIMESTAMPTZ DEFAULT NOW()\n' +
        ');\n' +
        'ALTER TABLE problematicas_sc ENABLE ROW LEVEL SECURITY;\n' +
        'CREATE POLICY "prob_read" ON problematicas_sc FOR SELECT USING (true);\n' +
        'CREATE POLICY "prob_write" ON problematicas_sc FOR ALL USING (true) WITH CHECK (true);',
      municipiosActualizados,
    }, { status: 500 })
  }

  // 4. Insertar alertas (upsert por URL para no duplicar)
  const alertasConUrl = ALERTAS.filter(a => a.url)
  const { data: insertados, error: insertError } = await supabase
    .from('problematicas_sc')
    .upsert(alertasConUrl.map(a => ({ ...a })), { onConflict: 'url', ignoreDuplicates: false })
    .select('id')

  resultados.alertasInsertadas = insertados?.length ?? 0
  if (insertError) resultados.alertasError = insertError.message

  return NextResponse.json({
    ok: true,
    ...resultados,
    total: ALERTAS.length,
  })
}

export async function GET() {
  return NextResponse.json({ status: 'seed-sc endpoint activo. Usar POST para cargar datos.' })
}
