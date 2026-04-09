'use client'

import { useCallback, useRef } from 'react'

/** Lightweight sound effects using the Web Audio API — no audio files needed. */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) => {
      try {
        const ctx = getCtx()
        const osc = ctx.createOscillator()
        const vol = ctx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        vol.gain.setValueAtTime(gain, ctx.currentTime)
        vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
        osc.connect(vol)
        vol.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + duration)
      } catch {
        // Silently fail — sound is non-essential
      }
    },
    [getCtx],
  )

  /** Short click when selecting / playing a card */
  const cardPlay = useCallback(() => {
    playTone(800, 0.08, 'triangle', 0.2)
    setTimeout(() => playTone(1200, 0.06, 'triangle', 0.12), 40)
  }, [playTone])

  /** Gentle chime when it becomes your turn */
  const yourTurn = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.18)
    setTimeout(() => playTone(659, 0.15, 'sine', 0.18), 120)
    setTimeout(() => playTone(784, 0.2, 'sine', 0.18), 240)
  }, [playTone])

  /** Rising arpeggio when you win a trick */
  const trickWin = useCallback(() => {
    playTone(523, 0.12, 'triangle', 0.2)
    setTimeout(() => playTone(659, 0.12, 'triangle', 0.2), 80)
    setTimeout(() => playTone(784, 0.12, 'triangle', 0.2), 160)
    setTimeout(() => playTone(1047, 0.25, 'triangle', 0.2), 240)
  }, [playTone])

  /** Descending tones for losing a trick */
  const trickLose = useCallback(() => {
    playTone(400, 0.15, 'sine', 0.1)
    setTimeout(() => playTone(350, 0.2, 'sine', 0.08), 120)
  }, [playTone])

  /** Bid confirmed */
  const bidPlace = useCallback(() => {
    playTone(600, 0.1, 'square', 0.08)
    setTimeout(() => playTone(900, 0.12, 'square', 0.06), 60)
  }, [playTone])

  /** Round complete */
  const roundEnd = useCallback(() => {
    playTone(440, 0.2, 'sine', 0.15)
    setTimeout(() => playTone(550, 0.2, 'sine', 0.15), 150)
    setTimeout(() => playTone(660, 0.3, 'sine', 0.15), 300)
  }, [playTone])

  /** Fanfare for game over */
  const gameOver = useCallback(() => {
    const notes = [523, 659, 784, 1047, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'triangle', 0.2), i * 140)
    })
  }, [playTone])

  /** Error buzz */
  const errorSound = useCallback(() => {
    playTone(200, 0.15, 'sawtooth', 0.1)
    setTimeout(() => playTone(180, 0.2, 'sawtooth', 0.08), 100)
  }, [playTone])

  return { cardPlay, yourTurn, trickWin, trickLose, bidPlace, roundEnd, gameOver, errorSound }
}
