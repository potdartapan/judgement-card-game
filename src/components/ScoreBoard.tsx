'use client'

import { GameState } from '@/shared/types'
import { totalScores } from '@/game/scoring'

interface Props {
  gameState: GameState
}

export default function ScoreBoard({ gameState }: Props) {
  const { players, scores, round } = gameState
  const totals = totalScores(scores)

  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-48">
      <h2 className="font-bold text-lg mb-3">Scores — Round {round}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="text-left pb-1">Player</th>
            <th className="text-right pb-1">Bid</th>
            <th className="text-right pb-1">Won</th>
            <th className="text-right pb-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {players.map(p => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="py-1">{p.name}</td>
              <td className="text-right">{p.bid ?? '—'}</td>
              <td className="text-right">{p.tricksWon}</td>
              <td className="text-right font-semibold">{totals[p.id] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
