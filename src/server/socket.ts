import { Server, Socket } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from '@/shared/types'
import {
  addPlayerToRoom,
  getRoom,
  getPlayerIdForSocket,
  removePlayerFromRoom,
  startGame,
  updateGameState,
} from './roomManager'
import { applyBid, applyPlayCard, advanceRound } from '@/game/state'

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: AppSocket) => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('joinRoom', (roomId, playerName, playerId) => {
      socket.join(roomId)
      const room = addPlayerToRoom(roomId, socket.id, playerId, playerName)
      io.to(roomId).emit('roomUpdated', room)
      // If game is in progress, send current state so reconnecting player catches up
      if (room.gameState) {
        socket.emit('gameStateUpdated', room.gameState)
      }
    })

    socket.on('startGame', (roomId, maxCards) => {
      const result = startGame(roomId, maxCards)
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

      const playerId = getPlayerIdForSocket(roomId, socket.id)
      if (!playerId) { socket.emit('error', 'Player not found'); return }

      const result = applyBid(room.gameState, playerId, bid)
      if (typeof result === 'string') { socket.emit('error', result); return }

      updateGameState(roomId, result)
      io.to(roomId).emit('gameStateUpdated', result)
    })

    socket.on('playCard', (roomId, card) => {
      const room = getRoom(roomId)
      if (!room?.gameState) { socket.emit('error', 'Game not started'); return }

      const playerId = getPlayerIdForSocket(roomId, socket.id)
      if (!playerId) { socket.emit('error', 'Player not found'); return }

      const result = applyPlayCard(room.gameState, playerId, card)
      if (typeof result === 'string') { socket.emit('error', result); return }

      updateGameState(roomId, result)
      io.to(roomId).emit('gameStateUpdated', result)

      // Auto-advance round after a delay so clients can see the last trick and scores
      if (result.phase === 'roundEnd') {
        setTimeout(() => {
          const r = getRoom(roomId)
          if (!r?.gameState || r.gameState.phase !== 'roundEnd') return
          const next = advanceRound(r.gameState)
          updateGameState(roomId, next)
          io.to(roomId).emit('gameStateUpdated', next)
        }, 5000)
      }
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue
        removePlayerFromRoom(roomId, socket.id)
        const room = getRoom(roomId)
        if (room) io.to(roomId).emit('roomUpdated', room)
      }
    })
  })
}
