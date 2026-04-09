import { Card, GameState, Player, Suit } from '@/shared/types'
import { buildLimitedDeck, deal, shuffle } from './deck'

/**
 * Trump follows a fixed cycle: Spades, Hearts, Diamonds, Clubs, No Trump, repeat.
 * Round number is 1-indexed.
 */
const TRUMP_CYCLE: (Suit | null)[] = ['spades', 'hearts', 'diamonds', 'clubs', null]
function trumpForRound(round: number): Suit | null {
  return TRUMP_CYCLE[(round - 1) % TRUMP_CYCLE.length]
}
import { allBidsPlaced, validateBid } from './bidding'
import { isValidPlay, newTrick, removeCardFromHand, resolveTrick, trickComplete } from './tricks'
import { calculateRoundScores } from './scoring'

/**
 * Number of cards dealt per round follows the Judgement pattern:
 * maxCards, maxCards-1, ... 1, ... maxCards-1, maxCards
 * where maxCards defaults to floor(52 / playerCount)
 */
export function buildRoundSequence(playerCount: number, maxCards?: number): number[] {
  const limit = Math.floor(52 / playerCount)
  const max = maxCards ? Math.min(maxCards, limit) : limit
  const down = Array.from({ length: max }, (_, i) => max - i)   // max, max-1, ..., 1
  const up = [...down].reverse().slice(1)                        // 2, 3, ..., max
  return [...down, ...up]
}

export function createInitialGameState(players: Player[], dealerIndex: number, maxCards?: number): GameState {
  const limit = Math.floor(52 / players.length)
  const effectiveMax = maxCards ? Math.min(maxCards, limit) : limit

  const roundSequence = buildRoundSequence(players.length, maxCards)
  const cardsThisRound = roundSequence[0] // first round uses all cards

  // Build the fixed game deck: playerCount × maxCardsPerRound cards, highest ranks
  const gameDeckSize = players.length * effectiveMax
  const gameDeck = buildLimitedDeck(gameDeckSize)

  // First round uses the entire game deck (shuffled)
  const [hands] = deal(shuffle([...gameDeck]), players.length, cardsThisRound)
  const trump = trumpForRound(1)

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
    maxCardsPerRound: effectiveMax,
    gameDeck,
    trump,
    phase: 'bidding',
    currentPlayerIndex: firstBidderIndex,
    currentTrick: newTrick(),
    lastCompletedTrick: null,
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
        return { ...state, players, phase: 'gameOver', completedTricks, currentTrick: newTrick(), lastCompletedTrick: finishedTrick, scores }
      }

      return { ...state, players, phase: 'roundEnd', completedTricks, currentTrick: newTrick(), lastCompletedTrick: finishedTrick, scores }
    }

    return {
      ...state,
      players,
      currentTrick: newTrick(),
      lastCompletedTrick: finishedTrick,
      completedTricks,
      currentPlayerIndex: winnerIndex,
    }
  }

  const nextIndex = (state.currentPlayerIndex + 1) % players.length
  return { ...state, players, currentTrick: updatedTrick, currentPlayerIndex: nextIndex }
}

export function advanceRound(state: GameState): GameState {
  const roundSequence = buildRoundSequence(state.players.length, state.maxCardsPerRound)
  const nextRound = state.round + 1
  const cardsThisRound = roundSequence[nextRound - 1]
  const nextDealerIndex = (state.dealerIndex + 1) % state.players.length
  const firstBidderIndex = (nextDealerIndex + 1) % state.players.length

  // Shuffle the fixed game deck, then take only the cards needed this round
  const cardsNeeded = state.players.length * cardsThisRound
  const shuffled = shuffle([...state.gameDeck])
  const roundCards = shuffled.slice(0, cardsNeeded)
  const [hands] = deal(roundCards, state.players.length, cardsThisRound)
  const trump = trumpForRound(nextRound)

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
    lastCompletedTrick: null,
    completedTricks: [],
    dealerIndex: nextDealerIndex,
  }
}
