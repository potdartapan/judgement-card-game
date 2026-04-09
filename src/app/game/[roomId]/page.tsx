'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useGameState } from '@/hooks/useGameState'
import { useSound } from '@/hooks/useSound'
import Hand from '@/components/Hand'
import TrickArea from '@/components/TrickArea'
import ScoreBoard from '@/components/ScoreBoard'
import BidSelector from '@/components/BidSelector'
import GameMenu from '@/components/GameMenu'
import { totalScores } from '@/game/scoring'
import type { GamePhase } from '@/shared/types'

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>()
  const { room, gameState, error, myPlayer, isMyTurn, joinRoom, startGame, placeBid, playCard } =
    useGameState(roomId)
  const sound = useSound()

  // Track previous state for triggering sounds
  const prevPhase = useRef<GamePhase | null>(null)
  const prevTurn = useRef(false)
  const prevTrickCount = useRef(0)

  useEffect(() => {
    if (!gameState) return

    // Your turn sound
    if (isMyTurn && !prevTurn.current && (gameState.phase === 'playing' || gameState.phase === 'bidding')) {
      sound.yourTurn()
    }

    // Round end sound
    if (gameState.phase === 'roundEnd' && prevPhase.current === 'playing') {
      sound.roundEnd()
    }

    // Game over sound
    if (gameState.phase === 'gameOver' && prevPhase.current !== 'gameOver') {
      sound.gameOver()
    }

    // Trick completed (someone won a trick)
    const totalTricks = gameState.completedTricks.length
    if (totalTricks > prevTrickCount.current && gameState.phase === 'playing') {
      const lastTrick = gameState.completedTricks[totalTricks - 1]
      if (lastTrick?.winnerId === myPlayer?.id) {
        sound.trickWin()
      } else {
        sound.trickLose()
      }
    }

    prevPhase.current = gameState.phase
    prevTurn.current = isMyTurn
    prevTrickCount.current = totalTricks
  }, [gameState, isMyTurn])

  // Error sound
  useEffect(() => {
    if (error) sound.errorSound()
  }, [error])

  useEffect(() => {
    const name = sessionStorage.getItem('playerName') ?? 'Player'
    joinRoom(name)

    const socket = (window as any).__judgementSocket
    if (socket) {
      const handleReconnect = () => joinRoom(name)
      socket.on('connect', handleReconnect)
      return () => { socket.off('connect', handleReconnect) }
    }
  }, [roomId])

  // Wrapped handlers to play sounds
  const handleBid = (bid: number) => {
    sound.bidPlace()
    placeBid(bid)
  }
  const handlePlayCard = (card: import('@/shared/types').Card) => {
    sound.cardPlay()
    playCard(card)
  }

  // ── Lobby ────────────────────────────────────────────────────────────────────
  const [maxCards, setMaxCards] = useState(7)

  if (!gameState || gameState.phase === 'waiting') {
    const players = Object.values(room?.playerNames ?? {})
    const playerCount = Math.max(players.length, 2)
    const cardLimit = Math.floor(52 / playerCount)

    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold animate-fade-in-up">Room: <span className="text-emerald-300 font-mono tracking-wider">{roomId}</span></h1>
        <div className="glass rounded-3xl p-5 sm:p-6 w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <p className="font-semibold mb-3 text-gray-300 text-sm">Players ({players.length})</p>
          <ul className="space-y-1.5 mb-4">
            {players.map(name => (
              <li key={name} className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                {name}
              </li>
            ))}
          </ul>

          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium mb-1.5 text-gray-300">Starting cards (max {cardLimit})</label>
            <input
              type="number"
              min={1}
              max={cardLimit}
              value={Math.min(maxCards, cardLimit)}
              onChange={e => setMaxCards(Math.max(1, Math.min(cardLimit, Number(e.target.value))))}
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Rounds: {Math.min(maxCards, cardLimit)} &rarr; 1 &rarr; {Math.min(maxCards, cardLimit)} ({2 * Math.min(maxCards, cardLimit) - 1} total)
            </p>
          </div>

          <button
            onClick={() => startGame(Math.min(maxCards, cardLimit))}
            disabled={players.length < 2}
            className={[
              'w-full font-bold py-2.5 rounded-xl transition-all duration-200',
              'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25',
              'hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]',
              'disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none',
              'btn-shimmer',
            ].join(' ')}
          >
            Start Game
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">Need at least 2 players</p>
        </div>
      </main>
    )
  }

  // ── Game Over ────────────────────────────────────────────────────────────────
  if (gameState.phase === 'gameOver') {
    const totals = totalScores(gameState.scores)
    const maxScore = Math.max(...Object.values(totals))
    const winners = gameState.players.filter(p => (totals[p.id] ?? 0) === maxScore)

    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 sm:gap-6 p-2 sm:p-4">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4"><GameMenu roomId={roomId} /></div>
        <h1 className="text-3xl sm:text-4xl font-extrabold animate-bounce-in">Game Over!</h1>
        <div className="animate-fade-in-up glass rounded-2xl px-6 py-4 text-center" style={{ animationDelay: '200ms' }}>
          <p className="text-lg sm:text-xl font-bold text-amber-300">
            {winners.length === 1
              ? `${winners[0].name} wins!`
              : `Tie: ${winners.map(w => w.name).join(' & ')}`}
          </p>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <ScoreBoard gameState={gameState} />
        </div>
      </main>
    )
  }

  // ── Active Game ──────────────────────────────────────────────────────────────
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const totalBidsSoFar = gameState.players.reduce((s, p) => s + (p.bid ?? 0), 0)
  const isLastBidder =
    gameState.currentPlayerIndex ===
    (gameState.dealerIndex + gameState.players.length) % gameState.players.length
  const forbiddenBid = isLastBidder
    ? gameState.cardsThisRound - totalBidsSoFar
    : undefined

  return (
    <main className="flex flex-col items-center gap-3 sm:gap-5 p-2 sm:p-4 min-h-screen relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between w-full max-w-4xl gap-2 sm:gap-0 items-center sm:items-start">
        <div className="flex items-center gap-3">
          <GameMenu roomId={roomId} />
          <div>
            <h1 className="text-base sm:text-xl font-bold">Round {gameState.round} <span className="text-gray-500 font-normal">/ {gameState.maxRounds}</span></h1>
            <span className="text-xs text-gray-500">{gameState.cardsThisRound} cards this round</span>
          </div>
        </div>
        <ScoreBoard gameState={gameState} />
      </div>

      {/* Trick area */}
      <TrickArea gameState={gameState} />

      {/* Status */}
      <div className={[
        'text-xs sm:text-sm font-medium text-center px-4 py-1.5 rounded-full transition-all duration-300',
        gameState.phase === 'roundEnd'
          ? 'glass text-amber-300'
          : isMyTurn
          ? 'bg-amber-400/15 text-amber-300 animate-glow rounded-full'
          : 'text-gray-400',
      ].join(' ')}>
        {gameState.phase === 'roundEnd'
          ? 'Round complete — next round starting soon...'
          : gameState.phase === 'bidding'
          ? isMyTurn
            ? 'Your turn to bid!'
            : `${currentPlayer.name} is bidding...`
          : isMyTurn
          ? 'Your turn to play!'
          : `Waiting for ${currentPlayer.name}...`}
      </div>

      {/* Bid selector */}
      {gameState.phase === 'bidding' && isMyTurn && myPlayer?.bid === null && (
        <BidSelector
          maxBid={gameState.cardsThisRound}
          onBid={handleBid}
          forbidden={forbiddenBid !== undefined && forbiddenBid >= 0 ? forbiddenBid : undefined}
        />
      )}

      {/* Player hand */}
      {myPlayer && (
        <Hand
          cards={myPlayer.hand}
          onPlayCard={handlePlayCard}
          canPlay={gameState.phase === 'playing' && isMyTurn}
        />
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-toast">
          <div className="glass bg-red-500/20 border-red-400/30 text-red-200 px-5 py-2.5 rounded-xl shadow-2xl text-sm font-medium">
            {error}
          </div>
        </div>
      )}
    </main>
  )
}
