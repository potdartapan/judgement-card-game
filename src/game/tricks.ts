import { Card, GameState, Suit, Trick, TrickCard } from '@/shared/types'
import { rankValue } from './deck'

/** Returns true if the card can legally be played given the player's hand and lead suit. */
export function isValidPlay(card: Card, hand: Card[], leadSuit: Suit | null): boolean {
  if (!leadSuit) return true  // first card of trick, anything goes
  const hasLeadSuit = hand.some(c => c.suit === leadSuit)
  if (hasLeadSuit) return card.suit === leadSuit
  return true  // no lead suit in hand, play anything
}

/** Determines the winner of a completed trick. Returns the playerId of the winner. */
export function resolveTrick(trick: Trick, trump: Suit | null): string {
  let winner = trick.cards[0]

  for (const played of trick.cards.slice(1)) {
    winner = beats(played, winner, trick.leadSuit!, trump) ? played : winner
  }

  return winner.playerId
}

function beats(challenger: TrickCard, current: TrickCard, leadSuit: Suit, trump: Suit | null): boolean {
  const cIsTrump = trump && challenger.card.suit === trump
  const wIsTrump = trump && current.card.suit === trump

  if (cIsTrump && !wIsTrump) return true
  if (!cIsTrump && wIsTrump) return false

  if (challenger.card.suit === current.card.suit) {
    return rankValue(challenger.card.rank) > rankValue(current.card.rank)
  }

  // challenger not trump, not lead suit — can't beat
  if (challenger.card.suit !== leadSuit) return false

  return rankValue(challenger.card.rank) > rankValue(current.card.rank)
}

/** Returns a new empty trick. */
export function newTrick(): Trick {
  return { cards: [], leadSuit: null, winnerId: null }
}

/** Returns true if all players have played to the current trick. */
export function trickComplete(trick: Trick, playerCount: number): boolean {
  return trick.cards.length === playerCount
}

/** Removes the played card from the player's hand. Returns the new hand. */
export function removeCardFromHand(hand: Card[], card: Card): Card[] {
  const idx = hand.findIndex(c => c.suit === card.suit && c.rank === card.rank)
  if (idx === -1) return hand
  return [...hand.slice(0, idx), ...hand.slice(idx + 1)]
}
