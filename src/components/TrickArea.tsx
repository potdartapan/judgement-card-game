'use client'

import { GameState } from '@/shared/types'
import Card from './Card'

interface Props {
  gameState: GameState
}

const SUIT_SYMBOLS: Record<string, string> = {
  spades: '\u2660', hearts: '\u2665', diamonds: '\u2666', clubs: '\u2663',
}

const SUIT_LABELS: Record<string, string> = {
  spades: 'Spades', hearts: 'Hearts', diamonds: 'Diamonds', clubs: 'Clubs',
}

export default function TrickArea({ gameState }: Props) {
  const { currentTrick, lastCompletedTrick, trump, players } = gameState

  const trickToShow = currentTrick.cards.length > 0
    ? currentTrick
    : lastCompletedTrick
  const showingPrevious = currentTrick.cards.length === 0 && lastCompletedTrick && lastCompletedTrick.cards.length > 0

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      {/* Trump badge */}
      <div className="glass rounded-full px-4 py-1.5 flex items-center gap-2">
        <span className="text-xs sm:text-sm text-gray-300 font-medium">Trump</span>
        {trump ? (
          <span className={[
            'text-lg sm:text-xl font-bold',
            ['hearts', 'diamonds'].includes(trump) ? 'text-red-400' : 'text-white',
          ].join(' ')}>
            {SUIT_SYMBOLS[trump]} <span className="text-xs sm:text-sm">{SUIT_LABELS[trump]}</span>
          </span>
        ) : (
          <span className="text-amber-300 font-bold text-xs sm:text-sm">No Trump</span>
        )}
      </div>

      {/* Trick winner label */}
      {showingPrevious && (
        <div className="animate-bounce-in glass rounded-lg px-3 py-1.5">
          <p className="text-xs sm:text-sm text-amber-300 font-medium">
            Trick won by {players.find(p => p.id === lastCompletedTrick!.winnerId)?.name ?? 'Unknown'}
          </p>
        </div>
      )}

      {/* Played cards area */}
      <div className="glass rounded-2xl px-4 sm:px-8 py-4 sm:py-6 min-w-[14rem] sm:min-w-[20rem] min-h-[6rem] sm:min-h-[8rem] flex items-center justify-center">
        {trickToShow && trickToShow.cards.length > 0 ? (
          <div className="flex gap-3 sm:gap-5 flex-wrap justify-center">
            {trickToShow.cards.map(({ playerId, card }) => {
              const player = players.find(p => p.id === playerId)
              const isWinner = showingPrevious && playerId === lastCompletedTrick!.winnerId
              return (
                <div
                  key={playerId}
                  className={[
                    'flex flex-col items-center gap-1 animate-card-play',
                    isWinner ? 'animate-glow rounded-xl p-1' : '',
                  ].join(' ')}
                >
                  <Card card={card} size="sm" />
                  <span className={[
                    'text-[10px] sm:text-xs font-medium',
                    isWinner ? 'text-amber-300' : 'text-gray-400',
                  ].join(' ')}>{player?.name ?? 'Unknown'}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-xs sm:text-sm italic">Waiting for first card...</p>
        )}
      </div>
    </div>
  )
}
