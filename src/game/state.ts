import { Card, GameState, Player, Suit } from '@/shared/types'
import { buildDeck, deal, shuffle } from './deck'
import { allBidsPlaced, validateBid } from './bidding'
import { isValidPlay, newTrick, removeCardFromHand, resolveTrick, trickComplete } from './tricks'
import { calculateRoundScores } from './scoring'

/**
 * Number of cards dealt per round follows the Judgement pattern:
 * 1, 2, ... max, ... 2, 1  (pyramid), where max = floor(52 / playerCount)
 */
export function buildRoundSequence(playerCount: number): number[] {
  const max = Math.floor(52 / playerCount)
  const up = Array.from({ length: max }, (_, i) => i + 1)
  const down = [...up].reverse().slice(1)
  return [...up, ...down]
}

export function createInitialGameState(players: Player[], dealerIndex: number): GameState {
  const roundSequence = buildRoundSequence(players.length)
  const cardsThisRound = roundSequence[0]

  const deck = shuffle(buildDeck())
  const [hands, remaining] = deal(deck, players.length, cardsThisRound)
  const trump: Suit | null = remaining[0]?.suit ?? null

  const initialPlayers = players.map((p, i) => ({
    ...p,
    hand: hands[i],
    bid: null,
    tricksWon: 0,
  }))

  const firstBidderIndex = (dealerIndex + 1) % players.length

  return {
    players: initialPlayers,
    round: 1,
    maxRounds: roundSequence.length,
    cardsThisRound,
    trump,
    phase: 'bidding',
    currentPlayerIndex: firstBidderIndex,
    currentTrick: newTrick(),
    completedTricks: [],
    scores: [],
    dealerIndex,
  }
}

export function applyBid(state: GameState, playerId: string, bid: number): GameState | string {
  const error = validateBid(state, playerId, bid)
  if (error) return error

  const players = state.players.map(p =>
    p.id === playerId ? { ...p, bid } : p
  )
  const nextIndex = (state.currentPlayerIndex + 1) % players.length
  const updatedState = { ...state, players, currentPlayerIndex: nextIndex }

  if (allBidsPlaced(updatedState)) {
    const firstPlayerIndex = (state.dealerIndex + 1) % players.length
    return { ...updatedState, phase: 'playing', currentPlayerIndex: firstPlayerIndex }
  }

  return updatedState
}

export function applyPlayCard(state: GameState, playerId: string, card: Card): GameState | string {
  const player = state.players.find(p => p.id === playerId)
  if (!player) return 'Player not found'
  if (state.players[state.currentPlayerIndex].id !== playerId) return 'Not your turn'

  const { leadSuit } = state.currentTrick
  if (!isValidPlay(card, player.hand, leadSuit)) {
    return `You must follow suit (${leadSuit})`
  }

  const updatedHand = removeCardFromHand(player.hand, card)
  const newCard = { playerId, card }
  const updatedTrick = {
    ...state.currentTrick,
    cards: [...state.currentTrick.cards, newCard],
    leadSuit: state.currentTrick.leadSuit ?? card.suit,
  }

  let players = state.players.map(p =>
    p.id === playerId ? { ...p, hand: updatedHand } : p
  )

  if (trickComplete(updatedTrick, players.length)) {
    const winnerId = resolveTrick(updatedTrick, state.trump)
    const finishedTrick = { ...updatedTrick, winnerId }

    players = players.map(p =>
      p.id === winnerId ? { ...p, tricksWon: p.tricksWon + 1 } : p
    )

    const completedTricks = [...state.completedTricks, finishedTrick]
    const winnerIndex = players.findIndex(p => p.id === winnerId)

    if (players[0].hand.length === 0) {
      // Round over
      const roundScores = calculateRoundScores({ ...state, players })
      const scores = [...state.scores, roundScores]

      if (state.round >= state.maxRounds) {
        return { ...state, players, phase: 'gameOver', completedTricks, currentTrick: newTrick(), scores }
      }

      return { ...state, players, phase: 'roundEnd', completedTricks, currentTrick: newTrick(), scores }
    }

    return {
      ...state,
      players,
      currentTrick: newTrick(),
      completedTricks,
      currentPlayerIndex: winnerIndex,
    }
  }

  const nextIndex = (state.currentPlayerIndex + 1) % players.length
  return { ...state, players, currentTrick: updatedTrick, currentPlayerIndex: nextIndex }
}

export function advanceRound(state: GameState): GameState {
  const roundSequence = buildRoundSequence(state.players.length)
  const nextRound = state.round + 1
  const cardsThisRound = roundSequence[nextRound - 1]
  const nextDealerIndex = (state.dealerIndex + 1) % state.players.length
  const firstBidderIndex = (nextDealerIndex + 1) % state.players.length

  const deck = shuffle(buildDeck())
  const [hands, remaining] = deal(deck, state.players.length, cardsThisRound)
  const trump: import('@/shared/types').Suit | null = remaining[0]?.suit ?? null

  const players = state.players.map((p, i) => ({
    ...p,
    hand: hands[i],
    bid: null,
    tricksWon: 0,
  }))

  return {
    ...state,
    players,
    round: nextRound,
    cardsThisRound,
    trump,
    phase: 'bidding',
    currentPlayerIndex: firstBidderIndex,
    currentTrick: newTrick(),
    completedTricks: [],
    dealerIndex: nextDealerIndex,
  }
}
