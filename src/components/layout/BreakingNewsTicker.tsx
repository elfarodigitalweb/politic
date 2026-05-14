'use client'

import { useBreakingNews } from '@/lib/hooks/useBreakingNews'

export function BreakingNewsTicker() {
  const items = useBreakingNews()

  if (items.length === 0) return null

  const tickerText = items.map((a) => a.title).join('   •   ')

  return (
    <div className="bg-[#E31E24] text-white text-xs font-semibold overflow-hidden">
      <div className="flex items-center max-w-7xl mx-auto px-4">
        <span className="flex-shrink-0 uppercase tracking-wider mr-3 py-1.5">
          Último momento
        </span>
        <div className="overflow-hidden flex-1 relative h-7 flex items-center">
          <p
            className="whitespace-nowrap animate-[ticker_30s_linear_infinite]"
            style={{ animation: `ticker ${Math.max(10, tickerText.length * 0.08)}s linear infinite` }}
          >
            {tickerText}
          </p>
        </div>
      </div>
    </div>
  )
}
