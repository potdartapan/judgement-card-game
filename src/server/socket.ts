import { Server, Socket } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from '@/shared/types'
import {
  addPlayerToRoom,
  getRoom,
  removePlayerFromRoom,
  startGame,
  updateGameState,
} from './roomManager'
import { applyBid, applyPlayCard, advanceRound } from '@/game/state'

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: AppSocket) => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('joinRoom', (roomId, playerName) => {
      socket.join(roomId)
      const room = addPlayerToRoom(roomId, socket.id, playerName)
      io.to(roomId).emit('roomUpdated', room)
    })

    socket.on('startGame', (roomId) => {
      const result = startGame(roomId)
      if (typeof result === 'string') {
        socket.emit('error', result)
        return
      }
      const room = getRoom(roomId)
      if (room) io.to(roomId).emit('roomUpdated', room)
      io.to(roomId).emit('gameStateUpdated', result)
    })

    socket.on('placeBid', (roomId, bid) => {
      const room = getRoom(roomId)
      if (!room?.gameState) { socket.emit('error', 'Game not started'); return }

      const result = applyBid(room.gameState, socket.id, bid)
      if (typeof result === 'string') { socket.emit('error', result); return }

      updateGameState(roomId, result)
      io.to(roomId).emit('gameStateUpdated', result)
    })

    socket.on('playCard', (roomId, card) => {
      const room = getRoom(roomId)
      if (!room?.gameState) { socket.emit('error', 'Game not started'); return }

      const result = applyPlayCard(room.gameState, socket.id, card)
      if (typeof result === 'string') { socket.emit('error', result); return }

      updateGameState(roomId, result)
      io.to(roomId).emit('gameStateUpdated', result)

      // Auto-advance round after a short delay so clients can show round-end screen
      if (result.phase === 'roundEnd') {
        setTimeout(() => {
          const r = getRoom(roomId)
          if (!r?.gameState || r.gameState.phase !== 'roundEnd') return
          const next = advanceRound(r.gameState)
          updateGameState(roomId, next)
          io.to(roomId).emit('gameStateUpdated', next)
        }, 3000)
      }
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
      // Remove from any rooms they were in
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue
        removePlayerFromRoom(roomId, socket.id)
        const room = getRoom(roomId)
        if (room) io.to(roomId).emit('roomUpdated', room)
      }
    })
  })
}
