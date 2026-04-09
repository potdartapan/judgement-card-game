import { GameState, Player, Room } from '@/shared/types'
import { createInitialGameState } from '@/game/state'

const rooms = new Map<string, Room>()

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId)
}

export function getOrCreateRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { id: roomId, gameState: null, playerNames: {}, socketToPlayer: {} })
  }
  return rooms.get(roomId)!
}

export function addPlayerToRoom(roomId: string, socketId: string, playerId: string, name: string): Room {
  const room = getOrCreateRoom(roomId)
  room.playerNames[playerId] = name
  room.socketToPlayer[socketId] = playerId
  return room
}

export function removePlayerFromRoom(roomId: string, socketId: string): Room | null {
  const room = rooms.get(roomId)
  if (!room) return null

  const playerId = room.socketToPlayer[socketId]
  delete room.socketToPlayer[socketId]

  // Only remove the player name if no other socket maps to them (fully disconnected)
  if (playerId) {
    const stillConnected = Object.values(room.socketToPlayer).includes(playerId)
    if (!stillConnected && !room.gameState) {
      // Only remove from lobby if game hasn't started — during a game, keep seat
      delete room.playerNames[playerId]
    }
  }

  if (Object.keys(room.playerNames).length === 0) {
    rooms.delete(roomId)
    return null
  }
  return room
}

export function getPlayerIdForSocket(roomId: string, socketId: string): string | null {
  const room = rooms.get(roomId)
  if (!room) return null
  return room.socketToPlayer[socketId] ?? null
}

export function startGame(roomId: string, maxCards?: number): GameState | string {
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
  const gameState = createInitialGameState(players, dealerIndex, maxCards)
  room.gameState = gameState
  return gameState
}

export function updateGameState(roomId: string, state: GameState): void {
  const room = rooms.get(roomId)
  if (room) room.gameState = state
}
