// ─── Card ────────────────────────────────────────────────────────────────────

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'

export interface Card {
  suit: Suit
  rank: Rank
}

// ─── Player ──────────────────────────────────────────────────────────────────

export interface Player {
  id: string
  name: string
  hand: Card[]
  bid: number | null     // null = hasn't bid yet
  tricksWon: number
}

// ─── Trick ───────────────────────────────────────────────────────────────────

export interface TrickCard {
  playerId: string
  card: Card
}

export interface Trick {
  cards: TrickCard[]
  leadSuit: Suit | null
  winnerId: string | null
}

// ─── Game ────────────────────────────────────────────────────────────────────

export type GamePhase = 'waiting' | 'bidding' | 'playing' | 'roundEnd' | 'gameOver'

export interface RoundScore {
  [playerId: string]: number
}

export interface GameState {
  players: Player[]
  round: number          // current round number (1-indexed)
  maxRounds: number      // total rounds in the game
  cardsThisRound: number // how many cards are dealt this round
  maxCardsPerRound: number // the starting (max) card count chosen at game start
  gameDeck: Card[]        // fixed pool of cards for the entire game
  trump: Suit | null
  phase: GamePhase
  currentPlayerIndex: number   // whose turn it is
  currentTrick: Trick
  lastCompletedTrick: Trick | null  // shown briefly before clearing
  completedTricks: Trick[]
  scores: RoundScore[]   // one entry per completed round
  dealerIndex: number
}

// ─── Room ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string
  gameState: GameState | null
  playerNames: Record<string, string>  // playerId -> name
  socketToPlayer: Record<string, string>  // socketId -> playerId
}

// ─── Socket Events ───────────────────────────────────────────────────────────

export interface ServerToClientEvents {
  roomUpdated: (room: Room) => void
  gameStateUpdated: (state: GameState) => void
  error: (message: string) => void
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string, playerName: string, playerId: string) => void
  startGame: (roomId: string, maxCards?: number) => void
  placeBid: (roomId: string, bid: number) => void
  playCard: (roomId: string, card: Card) => void
}
