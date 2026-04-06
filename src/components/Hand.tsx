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

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-gray-500">
        {canPlay ? 'Select a card to play (click twice to confirm)' : 'Your hand'}
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        {cards.map((card, i) => (
          <Card
            key={`${card.rank}-${card.suit}`}
            card={card}
            onClick={() => handleClick(i)}
            disabled={!canPlay}
            selected={selected === i}
          />
        ))}
      </div>
    </div>
  )
}
