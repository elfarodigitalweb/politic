-- Agregar coordenadas geográficas y tipo a municipios
ALTER TABLE municipios ADD COLUMN IF NOT EXISTS latitud DECIMAL(10,7);
ALTER TABLE municipios ADD COLUMN IF NOT EXISTS longitud DECIMAL(10,7);
ALTER TABLE municipios ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'departamento';

-- Marcar registros existentes como departamentos
UPDATE municipios SET tipo = 'departamento' WHERE tipo IS NULL OR tipo = 'departamento';

-- Insertar todas las localidades de Santa Cruz con coordenadas
DO $$
DECLARE sc_id INTEGER;
BEGIN
  SELECT id INTO sc_id FROM provincias WHERE slug = 'santa-cruz';
  IF sc_id IS NULL THEN
    RAISE NOTICE 'Provincia santa-cruz no encontrada — migracion omitida';
    RETURN;
  END IF;

  INSERT INTO municipios (nombre, slug, provincia_id, tipo, latitud, longitud, intendente_nombre)
  VALUES
    ('Río Gallegos',                     'rio-gallegos',                 sc_id, 'ciudad', -51.6232, -69.2168, NULL),
    ('Caleta Olivia',                    'caleta-olivia',                sc_id, 'ciudad', -46.4402, -67.5273, NULL),
    ('El Calafate',                      'el-calafate',                  sc_id, 'ciudad', -50.3380, -72.2648, NULL),
    ('Puerto Deseado',                   'puerto-deseado',               sc_id, 'ciudad', -47.7505, -65.9002, NULL),
    ('Las Heras',                        'las-heras-sc',                 sc_id, 'ciudad', -46.5471, -68.9613, NULL),
    ('Pico Truncado',                    'pico-truncado',                sc_id, 'ciudad', -46.7939, -67.9748, NULL),
    ('Puerto San Julián',                'puerto-san-julian',            sc_id, 'ciudad', -49.3066, -67.7181, NULL),
    ('Gobernador Gregores',              'gobernador-gregores',          sc_id, 'ciudad', -48.7822, -70.2489, NULL),
    ('Perito Moreno',                    'perito-moreno-sc',             sc_id, 'ciudad', -46.5544, -70.9271, NULL),
    ('Los Antiguos',                     'los-antiguos',                 sc_id, 'ciudad', -46.5487, -71.6278, NULL),
    ('El Chaltén',                       'el-chalten',                   sc_id, 'ciudad', -49.3317, -72.8856, NULL),
    ('Comandante Luis Piedra Buena',     'piedra-buena',                 sc_id, 'ciudad', -49.9756, -68.9082, NULL),
    ('Puerto Santa Cruz',                'puerto-santa-cruz',            sc_id, 'ciudad', -50.0135, -68.5195, NULL),
    ('28 de Noviembre',                  '28-de-noviembre',              sc_id, 'ciudad', -51.5951, -72.2085, NULL),
    ('Tres Lagos',                       'tres-lagos',                   sc_id, 'ciudad', -49.6019, -71.4811, NULL),
    ('Río Turbio',                       'rio-turbio',                   sc_id, 'ciudad', -51.5396, -72.3133, NULL)
  ON CONFLICT (slug) DO UPDATE SET
    tipo      = EXCLUDED.tipo,
    latitud   = EXCLUDED.latitud,
    longitud  = EXCLUDED.longitud;
END $$;
