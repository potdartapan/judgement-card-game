'use client'

import { GameState } from '@/shared/types'
import { totalScores } from '@/game/scoring'

interface Props {
  gameState: GameState
}

export default function ScoreBoard({ gameState }: Props) {
  const { players, scores, round, currentPlayerIndex, phase } = gameState
  const totals = totalScores(scores)
  const isActive = phase === 'bidding' || phase === 'playing'

  return (
    <div className="glass rounded-2xl p-2.5 sm:p-4 min-w-0 sm:min-w-52 text-xs sm:text-sm animate-fade-in">
      <h2 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-3 text-emerald-300">
        Scores — Round {round}
      </h2>
      <table className="w-full">
        <thead>
          <tr className="text-gray-400 border-b border-white/10">
            <th className="text-left pb-1 font-medium">Player</th>
            <th className="text-right pb-1 font-medium">Bid</th>
            <th className="text-right pb-1 font-medium">Won</th>
            <th className="text-right pb-1 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const isCurrent = isActive && i === currentPlayerIndex
            return (
              <tr
                key={p.id}
                className={[
                  'border-b border-white/5 last:border-0 transition-colors duration-300',
                  isCurrent ? 'bg-amber-400/15 text-amber-200' : 'text-gray-200',
                ].join(' ')}
              >
                <td className="py-1 sm:py-1.5 max-w-[5rem] truncate font-medium">
                  {isCurrent && <span className="mr-1 text-amber-400">&#9658;</span>}
                  {p.name}
                </td>
                <td className="text-right tabular-nums">{p.bid ?? '\u2014'}</td>
                <td className="text-right tabular-nums">{p.tricksWon}</td>
                <td className="text-right font-bold tabular-nums text-white">{totals[p.id] ?? 0}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
