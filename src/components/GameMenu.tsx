'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  roomId: string
}

export default function GameMenu({ roomId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState<'exit' | 'newGame' | null>(null)

  const handleExit = () => {
    sessionStorage.removeItem('playerId')
    router.push('/')
  }

  const handleNewGame = () => {
    sessionStorage.removeItem('playerId')
    router.push(`/game/${roomId}`)
    window.location.reload()
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); setConfirm(null) }}
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl glass hover:bg-white/15 transition-all duration-200 active:scale-90"
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="opacity-80">
          <rect y="3" width="20" height="2" rx="1" />
          <rect y="9" width="20" height="2" rx="1" />
          <rect y="15" width="20" height="2" rx="1" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => { setOpen(false); setConfirm(null) }} />
          <div className="absolute left-0 top-12 z-50 glass rounded-2xl shadow-2xl py-2 min-w-48 animate-slide-down">
            {confirm ? (
              <div className="px-4 py-3 flex flex-col gap-3">
                <p className="text-sm text-gray-300">
                  {confirm === 'exit' ? 'Leave this game?' : 'Start a new game?'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={confirm === 'exit' ? handleExit : handleNewGame}
                    className="flex-1 text-sm py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-medium transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirm(null)}
                    className="flex-1 text-sm py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setConfirm('newGame')}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors flex items-center gap-2.5 font-medium"
                >
                  <span className="text-base">&#8635;</span> New Game
                </button>
                <button
                  onClick={() => setConfirm('exit')}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors flex items-center gap-2.5 font-medium text-red-400"
                >
                  <span className="text-base">&#10005;</span> Exit to Home
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
