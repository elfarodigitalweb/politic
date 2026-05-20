-- Seed de las 24 entidades (23 provincias + CABA) con códigos INDEC oficiales.
-- Usa UPSERT por slug para que sea idempotente (se puede correr varias veces sin duplicar).

INSERT INTO provincias (slug, nombre, codigo_indec) VALUES
  ('ciudad-autonoma',     'Ciudad Autónoma de Buenos Aires', '02'),
  ('buenos-aires',        'Buenos Aires',                    '06'),
  ('catamarca',           'Catamarca',                       '10'),
  ('cordoba',             'Córdoba',                         '14'),
  ('corrientes',          'Corrientes',                      '18'),
  ('chaco',               'Chaco',                           '22'),
  ('chubut',              'Chubut',                          '26'),
  ('entre-rios',          'Entre Ríos',                      '30'),
  ('formosa',             'Formosa',                         '34'),
  ('jujuy',               'Jujuy',                           '38'),
  ('la-pampa',            'La Pampa',                        '42'),
  ('la-rioja',            'La Rioja',                        '46'),
  ('mendoza',             'Mendoza',                         '50'),
  ('misiones',            'Misiones',                        '54'),
  ('neuquen',             'Neuquén',                         '58'),
  ('rio-negro',           'Río Negro',                       '62'),
  ('salta',               'Salta',                           '66'),
  ('san-juan',            'San Juan',                        '70'),
  ('san-luis',            'San Luis',                        '74'),
  ('santa-cruz',          'Santa Cruz',                      '78'),
  ('santa-fe',            'Santa Fe',                        '82'),
  ('santiago-del-estero', 'Santiago del Estero',             '86'),
  ('tucuman',             'Tucumán',                         '90'),
  ('tierra-del-fuego',    'Tierra del Fuego',                '94')
ON CONFLICT (slug) DO UPDATE
  SET nombre = EXCLUDED.nombre,
      codigo_indec = EXCLUDED.codigo_indec;
