import type { RichTextBlock } from '@/types'

export function calcReadingTime(blocks: RichTextBlock[]): number {
  const text = blocks
    .flatMap((b) => ('children' in b ? b.children.map((c) => c.text) : []))
    .join(' ')
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
