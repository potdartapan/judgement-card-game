'use client'

import { useState } from 'react'

interface Props {
  maxBid: number
  onBid: (bid: number) => void
  forbidden?: number
}

export default function BidSelector({ maxBid, onBid, forbidden }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  const bids = Array.from({ length: maxBid + 1 }, (_, i) => i)

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full px-2 animate-fade-in-up">
      <p className="font-bold text-sm sm:text-base text-amber-300">Place your bid</p>
      <div className="flex gap-2 sm:gap-2.5 flex-wrap justify-center">
        {bids.map(bid => (
          <button
            key={bid}
            onClick={() => setSelected(bid)}
            disabled={bid === forbidden}
            className={[
              'w-10 h-10 sm:w-11 sm:h-11 rounded-full font-bold text-sm sm:text-base transition-all duration-150',
              bid === selected
                ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-gray-900 shadow-lg shadow-amber-400/30 scale-110'
                : 'glass text-white hover:bg-white/15',
              bid === forbidden
                ? 'opacity-20 cursor-not-allowed'
                : 'cursor-pointer active:scale-95',
            ].join(' ')}
          >
            {bid}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected !== null && onBid(selected)}
        disabled={selected === null}
        className={[
          'px-6 py-2 sm:px-8 sm:py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200',
          'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25',
          'hover:shadow-emerald-500/40 hover:scale-105 active:scale-95',
          'disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none',
          'btn-shimmer',
        ].join(' ')}
      >
        Confirm Bid
      </button>
    </div>
  )
}
