'use client'

import { Card as CardType } from '@/shared/types'

interface Props {
  card: CardType
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
  size?: 'sm' | 'md'
}

const SUIT_SYMBOLS: Record<string, string> = {
  spades: '\u2660',
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
}

const RED_SUITS = new Set(['hearts', 'diamonds'])

export default function Card({ card, onClick, disabled, selected, size = 'md' }: Props) {
  const isRed = RED_SUITS.has(card.suit)
  const symbol = SUIT_SYMBOLS[card.suit]

  const sizeClasses = size === 'sm'
    ? 'w-11 h-[4.2rem] text-xs p-1'
    : 'w-[3.2rem] h-[4.8rem] sm:w-[4.2rem] sm:h-[6.2rem] text-xs sm:text-sm p-1 sm:p-1.5'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-xl border-2 flex flex-col justify-between font-extrabold shadow-lg relative overflow-hidden',
        'bg-gradient-to-br from-white to-gray-50',
        sizeClasses,
        isRed ? 'text-red-500' : 'text-gray-800',
        selected
          ? 'border-amber-400 -translate-y-3 shadow-amber-400/40 shadow-xl ring-2 ring-amber-300/50'
          : 'border-gray-200/80',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300 cursor-pointer active:scale-95',
        'transition-all duration-150 ease-out',
      ].join(' ')}
    >
      {/* Subtle inner shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none" />
      <span className="relative z-10 leading-none">{card.rank}</span>
      <span className={[
        'relative z-10 self-center drop-shadow-sm',
        size === 'sm' ? 'text-base' : 'text-lg sm:text-2xl',
      ].join(' ')}>{symbol}</span>
      <span className="relative z-10 self-end rotate-180 leading-none">{card.rank}</span>
    </button>
  )
}
