-- =============================================================
-- FIX: keywords de intendentes para detección por ciudad
-- El analyzer busca primero por nombre y luego por ciudad.
-- Las keywords deben incluir "Ciudad Nombre" (sin "intendente")
-- para que la búsqueda por ciudad funcione correctamente.
-- =============================================================

-- Presidente
UPDATE politicos SET palabras_clave = ARRAY[
  'Javier Milei', 'Milei', 'La Libertad Avanza', 'presidente Milei', 'Casa Rosada', 'Argentina gobierno'
] WHERE slug = 'javier-milei';

-- Gobernador
UPDATE politicos SET palabras_clave = ARRAY[
  'Claudio Vidal', 'Vidal', 'gobernador Santa Cruz', 'SER Santa Cruz', 'gobierno Santa Cruz'
] WHERE slug = 'claudio-vidal';

-- Intendentes — palabras clave incluyen nombre Y ciudad sola
UPDATE politicos SET palabras_clave = ARRAY[
  'Pablo Grasso', 'Grasso', 'Río Gallegos', 'municipio Río Gallegos', 'capital Santa Cruz'
] WHERE slug = 'pablo-grasso';

UPDATE politicos SET palabras_clave = ARRAY[
  'Pablo Carrizo', 'Carrizo', 'Caleta Olivia', 'municipio Caleta Olivia'
] WHERE slug = 'pablo-carrizo';

UPDATE politicos SET palabras_clave = ARRAY[
  'Antonio Carambia', 'Carambia', 'Las Heras', 'municipio Las Heras', 'Las Heras Santa Cruz'
] WHERE slug = 'antonio-carambia';

UPDATE politicos SET palabras_clave = ARRAY[
  'Pablo Anabalón', 'Anabalón', 'Pico Truncado', 'municipio Pico Truncado'
] WHERE slug = 'pablo-anabalon';

UPDATE politicos SET palabras_clave = ARRAY[
  'Juan Martínez', 'Puerto Deseado', 'municipio Puerto Deseado', 'intendente Deseado'
] WHERE slug = 'juan-martinez-sc';

UPDATE politicos SET palabras_clave = ARRAY[
  'Daniel Gardonio', 'Gardonio', 'Puerto San Julián', 'San Julián', 'municipio San Julián'
] WHERE slug = 'daniel-gardonio';

UPDATE politicos SET palabras_clave = ARRAY[
  'Matías Treppo', 'Treppo', 'Perito Moreno', 'municipio Perito Moreno', 'Perito Moreno Santa Cruz'
] WHERE slug = 'matias-treppo';

UPDATE politicos SET palabras_clave = ARRAY[
  'Zulma Neira', 'Neira', 'Los Antiguos', 'municipio Los Antiguos'
] WHERE slug = 'zulma-neira';

UPDATE politicos SET palabras_clave = ARRAY[
  'Carina Bosso', 'Bosso', 'Gobernador Gregores', 'Gregores', 'municipio Gregores'
] WHERE slug = 'carina-bosso';

UPDATE politicos SET palabras_clave = ARRAY[
  'Juan Manuel Bórquez', 'Bórquez', 'Puerto Santa Cruz', 'municipio Puerto Santa Cruz'
] WHERE slug = 'juan-manuel-borquez';

UPDATE politicos SET palabras_clave = ARRAY[
  'Analía Farías', 'Farías', 'Piedra Buena', 'municipio Piedra Buena', 'Comandante Piedra Buena'
] WHERE slug = 'analia-farias';

UPDATE politicos SET palabras_clave = ARRAY[
  'Javier Belloni', 'Belloni', 'El Calafate', 'municipio El Calafate', 'Calafate noticias'
] WHERE slug = 'javier-belloni';

UPDATE politicos SET palabras_clave = ARRAY[
  'Néstor Ticó', 'Ticó', 'El Chaltén', 'municipio El Chaltén', 'Chaltén noticias'
] WHERE slug = 'nestor-tico';

UPDATE politicos SET palabras_clave = ARRAY[
  'Darío Menna', 'Menna', 'Río Turbio', 'municipio Río Turbio', 'Río Turbio noticias'
] WHERE slug = 'dario-menna';

UPDATE politicos SET palabras_clave = ARRAY[
  'Aldo Aravena', 'Aravena', '28 de Noviembre', 'municipio 28 de Noviembre'
] WHERE slug = 'aldo-aravena';

UPDATE politicos SET palabras_clave = ARRAY[
  'Nayla Fernández', 'Fernández Tres Lagos', 'Tres Lagos', 'comisión de fomento Tres Lagos'
] WHERE slug = 'nayla-fernandez';

-- Verificar
SELECT slug, nombre, palabras_clave FROM politicos ORDER BY nombre;
