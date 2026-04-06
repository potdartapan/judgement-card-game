'use client'

import { useState } from 'react'

interface Props {
  maxBid: number
  onBid: (bid: number) => void
  forbidden?: number  // bid value the last bidder cannot choose
}

export default function BidSelector({ maxBid, onBid, forbidden }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  const bids = Array.from({ length: maxBid + 1 }, (_, i) => i)

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-semibold">Place your bid</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {bids.map(bid => (
          <button
            key={bid}
            onClick={() => setSelected(bid)}
            disabled={bid === forbidden}
            className={[
              'w-10 h-10 rounded-full border-2 font-bold text-sm',
              bid === selected ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300',
              bid === forbidden ? 'opacity-30 cursor-not-allowed' : 'hover:border-blue-400 cursor-pointer',
            ].join(' ')}
          >
            {bid}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected !== null && onBid(selected)}
        disabled={selected === null}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-40"
      >
        Confirm Bid
      </button>
    </div>
  )
}
