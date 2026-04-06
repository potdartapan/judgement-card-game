'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useGameState } from '@/hooks/useGameState'
import Hand from '@/components/Hand'
import TrickArea from '@/components/TrickArea'
import ScoreBoard from '@/components/ScoreBoard'
import BidSelector from '@/components/BidSelector'

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>()
  const { room, gameState, error, myPlayer, isMyTurn, joinRoom, startGame, placeBid, playCard } =
    useGameState(roomId)

  useEffect(() => {
    const name = sessionStorage.getItem('playerName') ?? 'Player'
    joinRoom(name)
  }, [roomId])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-800 text-white p-6 rounded-xl text-center">
          <p className="font-bold text-lg">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // ── Lobby ────────────────────────────────────────────────────────────────────
  if (!gameState || gameState.phase === 'waiting') {
    const players = Object.values(room?.playerNames ?? {})
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
        <h1 className="text-3xl font-bold">Room: {roomId}</h1>
        <div className="bg-white text-gray-900 rounded-2xl p-6 w-full max-w-xs">
          <p className="font-semibold mb-3">Players ({players.length})</p>
          <ul className="space-y-1 mb-4">
            {players.map(name => <li key={name} className="text-sm">• {name}</li>)}
          </ul>
          <button
            onClick={startGame}
            disabled={players.length < 1}
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg disabled:opacity-40"
          >
            Start Game
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">Need at least 1 player</p>
        </div>
      </main>
    )
  }

  // ── Game Over ────────────────────────────────────────────────────────────────
  if (gameState.phase === 'gameOver') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
        <h1 className="text-3xl font-bold">Game Over!</h1>
        <ScoreBoard gameState={gameState} />
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
    <main className="flex flex-col items-center gap-6 p-4 min-h-screen">
      <div className="flex justify-between w-full max-w-4xl items-start">
        <h1 className="text-xl font-bold">Round {gameState.round} / {gameState.maxRounds}</h1>
        <ScoreBoard gameState={gameState} />
      </div>

      <TrickArea gameState={gameState} />

      <div className="text-sm text-green-300">
        {gameState.phase === 'bidding'
          ? `Bidding — ${currentPlayer.name}'s turn to bid`
          : isMyTurn
          ? 'Your turn to play!'
          : `Waiting for ${currentPlayer.name}...`}
      </div>

      {gameState.phase === 'bidding' && isMyTurn && myPlayer?.bid === null && (
        <BidSelector
          maxBid={gameState.cardsThisRound}
          onBid={placeBid}
          forbidden={forbiddenBid !== undefined && forbiddenBid >= 0 ? forbiddenBid : undefined}
        />
      )}

      {myPlayer && (
        <Hand
          cards={myPlayer.hand}
          onPlayCard={playCard}
          canPlay={gameState.phase === 'playing' && isMyTurn}
        />
      )}
    </main>
  )
}
