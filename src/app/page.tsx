'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')

  const generateRoomId = () => Math.random().toString(36).slice(2, 8).toUpperCase()

  const handleCreate = () => {
    if (!name.trim()) return
    const id = generateRoomId()
    sessionStorage.setItem('playerName', name.trim())
    router.push(`/game/${id}`)
  }

  const handleJoin = () => {
    if (!name.trim() || !roomId.trim()) return
    sessionStorage.setItem('playerName', name.trim())
    router.push(`/game/${roomId.trim().toUpperCase()}`)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2">Judgement</h1>
        <p className="text-green-300">A trick-taking card game</p>
      </div>

      <div className="bg-white text-gray-900 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-4 shadow-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg disabled:opacity-40"
        >
          Create Room
        </button>

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex-1 h-px bg-gray-200" />
          or join existing
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Room Code</label>
          <input
            type="text"
            value={roomId}
            onChange={e => setRoomId(e.target.value.toUpperCase())}
            placeholder="e.g. AB12CD"
            maxLength={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={!name.trim() || !roomId.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-40"
        >
          Join Room
        </button>
      </div>
    </main>
  )
}
