import { Card, Rank, Suit } from '@/shared/types'

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export function buildDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

export function shuffle(deck: Card[]): Card[] {
  const d = [...deck]
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

/** Deal `count` cards to each of `playerCount` players. Returns [hands, remaining]. */
export function deal(deck: Card[], playerCount: number, count: number): [Card[][], Card[]] {
  const hands: Card[][] = Array.from({ length: playerCount }, () => [])
  const remaining = [...deck]
  for (let i = 0; i < count; i++) {
    for (let p = 0; p < playerCount; p++) {
      const card = remaining.shift()
      if (card) hands[p].push(card)
    }
  }
  return [hands, remaining]
}

/** Returns numeric value of a rank for comparison (higher = stronger). */
export function rankValue(rank: Rank): number {
  return RANKS.indexOf(rank)
}
