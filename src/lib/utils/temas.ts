const TEMAS: Record<string, string[]> = {
  Economía: [
    'inflación', 'deuda', 'presupuesto', 'salario', 'desempleo',
    'económico', 'fiscal', 'déficit', 'ajuste', 'tarifas', 'dólar',
    'pesos', 'inversión', 'exportación', 'industria', 'comercio',
  ],
  Seguridad: [
    'crimen', 'robo', 'violencia', 'policía', 'delito', 'narco',
    'seguridad', 'homicidio', 'detenido', 'arrestado', 'preso',
    'gendarmería', 'fuerza', 'conflicto',
  ],
  'Obra pública': [
    'obras', 'inauguró', 'infraestructura', 'hospital', 'escuela',
    'construcción', 'vivienda', 'ruta', 'puente', 'pavimentación',
    'acueducto', 'gasoducto', 'edificio', 'instalación',
  ],
  Escándalo: [
    'corrupción', 'denuncia', 'fraude', 'procesado', 'irregularidad',
    'acusado', 'imputado', 'causa', 'juicio', 'fiscal', 'tribunal',
    'coimas', 'soborno', 'escándalo', 'renunció',
  ],
  Social: [
    'salud', 'educación', 'pobreza', 'social', 'vecinos', 'asistencia',
    'beneficio', 'pensión', 'jubilados', 'familias', 'niños',
    'alimentario', 'comedor', 'subsidio',
  ],
  Electoral: [
    'elecciones', 'candidato', 'campaña', 'voto', 'partido', 'alianza',
    'primarias', 'PASO', 'internas', 'lista', 'fórmula', 'coalición',
  ],
  Medioambiente: [
    'ambiente', 'ecología', 'minería', 'petróleo', 'hidrocarburos',
    'incendio', 'glaciar', 'contaminación', 'pesca', 'forestal',
  ],
}

export function detectarTema(texto: string): string {
  const lower = texto.toLowerCase()
  for (const [tema, keywords] of Object.entries(TEMAS)) {
    if (keywords.some((kw) => lower.includes(kw))) return tema
  }
  return 'General'
}

export const TEMA_COLORES: Record<string, string> = {
  Economía: 'bg-blue-100 text-blue-700',
  Seguridad: 'bg-orange-100 text-orange-700',
  'Obra pública': 'bg-green-100 text-green-700',
  Escándalo: 'bg-red-100 text-red-700',
  Social: 'bg-purple-100 text-purple-700',
  Electoral: 'bg-yellow-100 text-yellow-700',
  Medioambiente: 'bg-emerald-100 text-emerald-700',
  General: 'bg-gray-100 text-gray-600',
}
