'use client'

import { useState } from 'react'
import { Card as CardType } from '@/shared/types'
import Card from './Card'

interface Props {
  cards: CardType[]
  onPlayCard: (card: CardType) => void
  canPlay: boolean
}

export default function Hand({ cards, onPlayCard, canPlay }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleClick = (index: number) => {
    if (!canPlay) return
    if (selected === index) {
      onPlayCard(cards[index])
      setSelected(null)
    } else {
      setSelected(index)
    }
  }

  const overlap = cards.length > 6

  return (
    <div className="flex flex-col items-center gap-2 w-full px-2">
      <p className={[
        'text-xs sm:text-sm transition-colors duration-300',
        canPlay ? 'text-amber-300 font-medium' : 'text-gray-500',
      ].join(' ')}>
        {canPlay ? 'Tap a card, then tap again to play' : 'Your hand'}
      </p>
      <div
        className="flex justify-center"
        style={overlap ? { gap: 0 } : undefined}
      >
        {cards.map((card, i) => (
          <div
            key={`${card.rank}-${card.suit}`}
            className={[
              overlap ? '' : 'mx-0.5 sm:mx-1',
              'animate-card-deal',
            ].join(' ')}
            style={overlap ? { marginLeft: i === 0 ? 0 : '-0.4rem' } : undefined}
          >
            <Card
              card={card}
              onClick={() => handleClick(i)}
              disabled={!canPlay}
              selected={selected === i}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
