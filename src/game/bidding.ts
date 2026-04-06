import { GameState } from '@/shared/types'

/**
 * Returns an error string if the bid is invalid, or null if valid.
 * Rule: the last bidder cannot bid an amount that makes total bids equal tricks available.
 */
export function validateBid(state: GameState, playerId: string, bid: number): string | null {
  const { players, cardsThisRound, currentPlayerIndex } = state

  if (bid < 0 || bid > cardsThisRound) {
    return `Bid must be between 0 and ${cardsThisRound}`
  }

  const isLastBidder = currentPlayerIndex === (state.dealerIndex + players.length) % players.length

  if (isLastBidder) {
    const totalSoFar = players.reduce((sum, p) => sum + (p.bid ?? 0), 0)
    if (totalSoFar + bid === cardsThisRound) {
      return `Last bidder cannot make total bids equal ${cardsThisRound}`
    }
  }

  return null
}

/** Returns true if all players have placed their bids. */
export function allBidsPlaced(state: GameState): boolean {
  return state.players.every(p => p.bid !== null)
}
