import { GameState, RoundScore } from '@/shared/types'

const HIT_BONUS = 10

/**
 * Calculates scores for the just-completed round.
 * Hit (bid === tricksWon): +10 + bid points
 * Miss: 0 points
 */
export function calculateRoundScores(state: GameState): RoundScore {
  const scores: RoundScore = {}

  for (const player of state.players) {
    const bid = player.bid ?? 0
    const won = player.tricksWon

    if (bid === won) {
      scores[player.id] = HIT_BONUS + bid
    } else {
      scores[player.id] = 0
    }
  }

  return scores
}

/** Returns cumulative total score per player across all completed rounds. */
export function totalScores(scores: RoundScore[]): RoundScore {
  const totals: RoundScore = {}
  for (const round of scores) {
    for (const [playerId, score] of Object.entries(round)) {
      totals[playerId] = (totals[playerId] ?? 0) + score
    }
  }
  return totals
}
