'use client'

import { useEffect, useState } from 'react'
import { GameState, Room } from '@/shared/types'
import { useSocket, getPlayerId } from './useSocket'

export function useGameState(roomId: string) {
  const socket = useSocket()
  const playerId = getPlayerId()
  const [room, setRoom] = useState<Room | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleError = (msg: string) => {
      setError(msg)
      setTimeout(() => setError(null), 4000)
    }

    socket.on('roomUpdated', setRoom)
    socket.on('gameStateUpdated', setGameState)
    socket.on('error', handleError)

    return () => {
      socket.off('roomUpdated', setRoom)
      socket.off('gameStateUpdated', setGameState)
      socket.off('error', handleError)
    }
  }, [socket])

  const joinRoom = (playerName: string) => socket.emit('joinRoom', roomId, playerName, playerId)
  const startGame = (maxCards?: number) => socket.emit('startGame', roomId, maxCards)
  const placeBid = (bid: number) => socket.emit('placeBid', roomId, bid)
  const playCard = (card: import('@/shared/types').Card) => socket.emit('playCard', roomId, card)

  const myPlayer = gameState?.players.find(p => p.id === playerId) ?? null
  const isMyTurn = gameState?.players[gameState.currentPlayerIndex]?.id === playerId

  return { room, gameState, error, myPlayer, isMyTurn, joinRoom, startGame, placeBid, playCard }
}
