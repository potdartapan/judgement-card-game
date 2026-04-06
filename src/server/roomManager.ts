import { GameState, Player, Room } from '@/shared/types'
import { createInitialGameState } from '@/game/state'

const rooms = new Map<string, Room>()

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId)
}

export function getOrCreateRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { id: roomId, gameState: null, playerNames: {} })
  }
  return rooms.get(roomId)!
}

export function addPlayerToRoom(roomId: string, socketId: string, name: string): Room {
  const room = getOrCreateRoom(roomId)
  room.playerNames[socketId] = name
  return room
}

export function removePlayerFromRoom(roomId: string, socketId: string): Room | null {
  const room = rooms.get(roomId)
  if (!room) return null
  delete room.playerNames[socketId]
  if (Object.keys(room.playerNames).length === 0) {
    rooms.delete(roomId)
    return null
  }
  return room
}

export function startGame(roomId: string): GameState | string {
  const room = rooms.get(roomId)
  if (!room) return 'Room not found'

  const playerIds = Object.keys(room.playerNames)
  if (playerIds.length < 2) return 'Need at least 2 players to start'
  if (playerIds.length > 6) return 'Maximum 6 players allowed'

  const players: Player[] = playerIds.map(id => ({
    id,
    name: room.playerNames[id],
    hand: [],
    bid: null,
    tricksWon: 0,
  }))

  const dealerIndex = 0
  const gameState = createInitialGameState(players, dealerIndex)
  room.gameState = gameState
  return gameState
}

export function updateGameState(roomId: string, state: GameState): void {
  const room = rooms.get(roomId)
  if (room) room.gameState = state
}
