'use client'

import { Card as CardType } from '@/shared/types'

interface Props {
  card: CardType
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
}

const SUIT_SYMBOLS: Record<string, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
}

const RED_SUITS = new Set(['hearts', 'diamonds'])

export default function Card({ card, onClick, disabled, selected }: Props) {
  const isRed = RED_SUITS.has(card.suit)
  const symbol = SUIT_SYMBOLS[card.suit]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-16 h-24 rounded-lg border-2 bg-white flex flex-col justify-between p-1 text-sm font-bold shadow',
        isRed ? 'text-red-600' : 'text-gray-900',
        selected ? 'border-blue-500 -translate-y-2' : 'border-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 cursor-pointer',
        'transition-transform duration-100',
      ].join(' ')}
    >
      <span>{card.rank}</span>
      <span className="text-xl self-center">{symbol}</span>
      <span className="self-end rotate-180">{card.rank}</span>
    </button>
  )
}
