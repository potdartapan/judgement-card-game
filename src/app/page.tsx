'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SUIT_SYMBOLS = ['\u2660', '\u2665', '\u2666', '\u2663']

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
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 sm:gap-8 p-3 sm:p-4">
      {/* Title */}
      <div className="text-center animate-fade-in-up">
        <div className="flex justify-center gap-2 text-2xl mb-3 opacity-40">
          {SUIT_SYMBOLS.map((s, i) => (
            <span key={i} className={i % 2 === 1 ? 'text-red-400' : ''}>{s}</span>
          ))}
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
          Judgement
        </h1>
        <p className="text-emerald-300/80 text-sm sm:text-base font-medium">A trick-taking card game</p>
      </div>

      {/* Form card */}
      <div className="glass rounded-3xl p-6 sm:p-8 w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 text-gray-300">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className={[
            'w-full font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-200',
            'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25',
            'hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]',
            'disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none',
            'btn-shimmer',
          ].join(' ')}
        >
          Create Room
        </button>

        <div className="flex items-center gap-3 text-gray-500 text-xs sm:text-sm">
          <div className="flex-1 h-px bg-white/10" />
          or join existing
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 text-gray-300">Room Code</label>
          <input
            type="text"
            value={roomId}
            onChange={e => setRoomId(e.target.value.toUpperCase())}
            placeholder="e.g. AB12CD"
            maxLength={6}
            className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-white uppercase tracking-[0.25em] placeholder-gray-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={!name.trim() || !roomId.trim()}
          className={[
            'w-full font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-200',
            'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25',
            'hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]',
            'disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none',
            'btn-shimmer',
          ].join(' ')}
        >
          Join Room
        </button>
      </div>
    </main>
  )
}
