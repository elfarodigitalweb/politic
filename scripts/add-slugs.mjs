import fs from 'fs'

function toSlug(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Mapeo de nombres que pueden venir en inglés u otras formas
const NOMBRE_MAP = {
  'buenos aires': 'buenos-aires',
  'catamarca': 'catamarca',
  'chaco': 'chaco',
  'chubut': 'chubut',
  'cordoba': 'cordoba',
  'corrientes': 'corrientes',
  'entre rios': 'entre-rios',
  'formosa': 'formosa',
  'jujuy': 'jujuy',
  'la pampa': 'la-pampa',
  'la rioja': 'la-rioja',
  'mendoza': 'mendoza',
  'misiones': 'misiones',
  'neuquen': 'neuquen',
  'rio negro': 'rio-negro',
  'salta': 'salta',
  'san juan': 'san-juan',
  'san luis': 'san-luis',
  'santa cruz': 'santa-cruz',
  'santa fe': 'santa-fe',
  'santiago del estero': 'santiago-del-estero',
  'tierra del fuego': 'tierra-del-fuego',
  'tucuman': 'tucuman',
  'ciudad autonoma de buenos aires': 'ciudad-autonoma',
  'ciudad de buenos aires': 'ciudad-autonoma',
  'ciudad autonoma buenos aires': 'ciudad-autonoma',
  'ciudad-autonoma-de-buenos-aires': 'ciudad-autonoma',
  'ciudad-de-buenos-aires': 'ciudad-autonoma',
}

const geoPath = 'public/geojson/argentina-provincias.geojson'
const geo = JSON.parse(fs.readFileSync(geoPath, 'utf8'))

geo.features = geo.features.map(f => {
  const props = f.properties
  // Intentar obtener nombre de varias propiedades posibles
  const rawNombre = props.nombre || props.NAME || props.name || props.NAM || props.NOMBRE || props.NAME_1 || ''
  const normalizado = toSlug(rawNombre)
  const slug = NOMBRE_MAP[normalizado] || normalizado

  return {
    ...f,
    properties: {
      ...props,
      nombre: rawNombre,
      slug: slug
    }
  }
})

fs.writeFileSync(geoPath, JSON.stringify(geo))
console.log(`✓ Provincias: ${geo.features.length} features`)
console.log('Slugs generados:', geo.features.map(f => f.properties.slug).join(', '))
