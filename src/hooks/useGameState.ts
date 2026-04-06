'use client'

import { useEffect, useState } from 'react'
import { GameState, Room } from '@/shared/types'
import { useSocket } from './useSocket'

export function useGameState(roomId: string) {
  const socket = useSocket()
  const [room, setRoom] = useState<Room | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    socket.on('roomUpdated', setRoom)
    socket.on('gameStateUpdated', setGameState)
    socket.on('error', setError)

    return () => {
      socket.off('roomUpdated', setRoom)
      socket.off('gameStateUpdated', setGameState)
      socket.off('error', setError)
    }
  }, [socket])

  const joinRoom = (playerName: string) => socket.emit('joinRoom', roomId, playerName)
  const startGame = () => socket.emit('startGame', roomId)
  const placeBid = (bid: number) => socket.emit('placeBid', roomId, bid)
  const playCard = (card: import('@/shared/types').Card) => socket.emit('playCard', roomId, card)

  const myPlayer = gameState?.players.find(p => p.id === socket.id) ?? null
  const isMyTurn = gameState?.players[gameState.currentPlayerIndex]?.id === socket.id

  return { room, gameState, error, myPlayer, isMyTurn, joinRoom, startGame, placeBid, playCard }
}
