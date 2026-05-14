'use client'

import { useEffect, useState } from 'react'
import type { Article } from '@/types'

export function useBreakingNews(intervalMs = 60_000) {
  const [items, setItems] = useState<Article[]>([])

  useEffect(() => {
    async function fetchBreaking() {
      try {
        const res = await fetch('/api/breaking')
        if (res.ok) setItems(await res.json())
      } catch {
        // silently ignore network errors — stale data is fine
      }
    }

    fetchBreaking()
    const id = setInterval(fetchBreaking, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return items
}
