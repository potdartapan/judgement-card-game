'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@/shared/types'

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: AppSocket | null = null

export function useSocket(): AppSocket {
  const ref = useRef<AppSocket | null>(null)

  if (!ref.current) {
    if (!socket) {
      socket = io({ path: '/api/socket' })
    }
    ref.current = socket
  }

  useEffect(() => {
    return () => {
      // Don't disconnect on unmount — keep the socket alive across page navigations
    }
  }, [])

  return ref.current
}
