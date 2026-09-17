import { create } from 'zustand'
import { recordPlay } from '../db/stats'
import type { RepeatMode, SongWithRelations } from '../types'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface PlayerState {
  queue: SongWithRelations[]
  sourceQueue: SongWithRelations[]
  queueIndex: number
  currentSong: SongWithRelations | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
  loading: boolean

  playQueue: (songs: SongWithRelations[], startIndex: number) => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  addNext: (song: SongWithRelations) => void
  addToEnd: (song: SongWithRelations) => void
  removeFromQueue: (index: number) => void
  playFromQueueIndex: (index: number) => void
  handleEnded: () => void
  stop: () => void
}

const audioEl = new Audio()
audioEl.preload = 'metadata'

let currentObjectUrl: string | null = null
let accumulatedMs = 0
let lastCurrentTime = 0

function setSource(song: SongWithRelations) {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
  currentObjectUrl = URL.createObjectURL(song.fileBlob)
  audioEl.src = currentObjectUrl
  accumulatedMs = 0
  lastCurrentTime = 0
}

function flushHistory(songId: string | undefined, completed: boolean) {
  if (!songId || accumulatedMs <= 0) {
    accumulatedMs = 0
    return
  }
  void recordPlay(songId, Math.round(accumulatedMs), completed)
  accumulatedMs = 0
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  audioEl.addEventListener('timeupdate', () => {
    const t = audioEl.currentTime
    const delta = t - lastCurrentTime
    if (delta > 0 && delta < 2 && !audioEl.paused) accumulatedMs += delta * 1000
    lastCurrentTime = t
    set({ currentTime: t })
  })
  audioEl.addEventListener('loadedmetadata', () => set({ duration: audioEl.duration || 0 }))
  audioEl.addEventListener('play', () => set({ isPlaying: true }))
  audioEl.addEventListener('pause', () => set({ isPlaying: false }))
  audioEl.addEventListener('waiting', () => set({ loading: true }))
  audioEl.addEventListener('canplay', () => set({ loading: false }))
  audioEl.addEventListener('ended', () => get().handleEnded())

  function loadAndPlay(index: number) {
    const song = get().queue[index]
    if (!song) return
    flushHistory(get().currentSong?.id, false)
    setSource(song)
    set({ queueIndex: index, currentSong: song, currentTime: 0, duration: 0, loading: true })
    audioEl.play().catch(() => {})
  }

  return {
    queue: [],
    sourceQueue: [],
    queueIndex: -1,
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.85,
    muted: false,
    shuffle: false,
    repeat: 'off',
    loading: false,

    playQueue: (songs, startIndex) => {
      if (songs.length === 0) return
      const { shuffle } = get()
      let queue = songs
      let idx = startIndex
      if (shuffle) {
        const chosen = songs[startIndex]
        const rest = shuffleArray(songs.filter((_, i) => i !== startIndex))
        queue = [chosen, ...rest]
        idx = 0
      }
      set({ sourceQueue: songs, queue })
      loadAndPlay(idx)
    },

    playFromQueueIndex: (index) => loadAndPlay(index),

    togglePlay: () => {
      if (!get().currentSong) return
      if (audioEl.paused) audioEl.play().catch(() => {})
      else audioEl.pause()
    },

    next: () => {
      const { queue, queueIndex, repeat } = get()
      if (queue.length === 0) return
      let nextIndex = queueIndex + 1
      if (nextIndex >= queue.length) {
        if (repeat === 'all') nextIndex = 0
        else {
          flushHistory(get().currentSong?.id, false)
          audioEl.pause()
          set({ isPlaying: false })
          return
        }
      }
      loadAndPlay(nextIndex)
    },

    prev: () => {
      const { queueIndex } = get()
      if (audioEl.currentTime > 3) {
        audioEl.currentTime = 0
        return
      }
      const prevIndex = queueIndex - 1 < 0 ? 0 : queueIndex - 1
      loadAndPlay(prevIndex)
    },

    seek: (time) => {
      audioEl.currentTime = time
      lastCurrentTime = time
      set({ currentTime: time })
    },

    setVolume: (v) => {
      audioEl.volume = v
      audioEl.muted = v === 0
      set({ volume: v, muted: v === 0 })
    },

    toggleMute: () => {
      const muted = !audioEl.muted
      audioEl.muted = muted
      set({ muted })
    },

    toggleShuffle: () => {
      const { shuffle, queue, sourceQueue, currentSong } = get()
      if (!shuffle) {
        const idx = queue.findIndex((s) => s.id === currentSong?.id)
        const current = queue[idx]
        const rest = shuffleArray(queue.filter((_, i) => i !== idx))
        set({ shuffle: true, queue: current ? [current, ...rest] : rest, queueIndex: current ? 0 : 0 })
      } else {
        const idx = sourceQueue.findIndex((s) => s.id === currentSong?.id)
        set({ shuffle: false, queue: sourceQueue, queueIndex: idx < 0 ? 0 : idx })
      }
    },

    cycleRepeat: () => {
      const order: RepeatMode[] = ['off', 'all', 'one']
      const next = order[(order.indexOf(get().repeat) + 1) % order.length]
      set({ repeat: next })
    },

    addNext: (song) => {
      const { queue, queueIndex } = get()
      const filtered = queue.filter((s) => s.id !== song.id)
      const insertAt = Math.min(queueIndex + 1, filtered.length)
      filtered.splice(insertAt, 0, song)
      set({ queue: filtered })
    },

    addToEnd: (song) => {
      set((s) => ({ queue: [...s.queue, song] }))
    },

    removeFromQueue: (index) => {
      const { queue, queueIndex } = get()
      if (index === queueIndex) return
      const next = queue.filter((_, i) => i !== index)
      set({ queue: next, queueIndex: index < queueIndex ? queueIndex - 1 : queueIndex })
    },

    handleEnded: () => {
      const { repeat, currentSong } = get()
      flushHistory(currentSong?.id, true)
      if (repeat === 'one') {
        audioEl.currentTime = 0
        audioEl.play().catch(() => {})
        return
      }
      get().next()
    },

    stop: () => {
      flushHistory(get().currentSong?.id, false)
      audioEl.pause()
      audioEl.removeAttribute('src')
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
      currentObjectUrl = null
      set({ currentSong: null, queue: [], sourceQueue: [], queueIndex: -1, isPlaying: false, currentTime: 0, duration: 0 })
    },
  }
})

window.addEventListener('beforeunload', () => {
  flushHistory(usePlayerStore.getState().currentSong?.id, false)
})
