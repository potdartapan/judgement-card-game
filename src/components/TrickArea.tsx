'use client'

import { GameState } from '@/shared/types'
import Card from './Card'

interface Props {
  gameState: GameState
}

const SUIT_SYMBOLS: Record<string, string> = {
  spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣',
}

export default function TrickArea({ gameState }: Props) {
  const { currentTrick, trump, players } = gameState

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 items-center text-sm">
        <span className="font-semibold">Trump:</span>
        {trump ? (
          <span className={`text-xl ${['hearts', 'diamonds'].includes(trump) ? 'text-red-600' : 'text-gray-900'}`}>
            {SUIT_SYMBOLS[trump]}
          </span>
        ) : (
          <span className="text-gray-400">None</span>
        )}
      </div>

      <div className="flex gap-4 flex-wrap justify-center min-h-28 items-center">
        {currentTrick.cards.map(({ playerId, card }) => {
          const player = players.find(p => p.id === playerId)
          return (
            <div key={playerId} className="flex flex-col items-center gap-1">
              <Card card={card} />
              <span className="text-xs text-gray-500">{player?.name ?? 'Unknown'}</span>
            </div>
          )
        })}
        {currentTrick.cards.length === 0 && (
          <p className="text-gray-400 text-sm">Waiting for first card...</p>
        )}
      </div>
    </div>
  )
}
