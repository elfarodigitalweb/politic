import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

function parseDate(dateStr: string): Date {
  // Intentar ISO primero, luego fallback a new Date (acepta RFC 822 de RSS)
  const iso = parseISO(dateStr)
  if (isValid(iso)) return iso
  const fallback = new Date(dateStr)
  if (isValid(fallback)) return fallback
  return new Date()
}

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(parseDate(dateStr), { addSuffix: true, locale: es })
}

export function formatDate(dateStr: string): string {
  return format(parseDate(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es })
}

export function formatDateShort(dateStr: string): string {
  return format(parseDate(dateStr), 'dd/MM/yyyy HH:mm', { locale: es })
}
