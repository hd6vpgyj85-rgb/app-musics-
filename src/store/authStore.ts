import { create } from 'zustand'
import { db } from '../db/db'
import { newId } from '../lib/id'
import { generateSalt, hashPassword, isMarkedUnlocked, markLocked, markUnlocked } from '../lib/auth'
import type { User } from '../types'

interface AuthState {
  user: User | null
  hasAccount: boolean
  unlocked: boolean
  ready: boolean
  error: string | null
  init: () => Promise<void>
  register: (username: string, password: string) => Promise<void>
  login: (password: string) => Promise<boolean>
  lock: () => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hasAccount: false,
  unlocked: false,
  ready: false,
  error: null,

  init: async () => {
    const user = await db.users.toCollection().first()
    set({ user: user ?? null, hasAccount: !!user, unlocked: !!user && isMarkedUnlocked(), ready: true })
  },

  register: async (username: string, password: string) => {
    if (!username.trim() || password.length < 4) {
      set({ error: 'Usuario requerido y contraseña de al menos 4 caracteres.' })
      return
    }
    const salt = generateSalt()
    const passwordHash = await hashPassword(password, salt)
    const user: User = { id: newId(), username: username.trim(), passwordHash, salt, createdAt: Date.now() }
    await db.users.add(user)
    markUnlocked()
    set({ user, hasAccount: true, unlocked: true, error: null })
  },

  login: async (password: string) => {
    const user = get().user ?? (await db.users.toCollection().first()) ?? null
    if (!user) {
      set({ error: 'No existe una cuenta local.' })
      return false
    }
    const hash = await hashPassword(password, user.salt)
    if (hash !== user.passwordHash) {
      set({ error: 'Contraseña incorrecta.' })
      return false
    }
    markUnlocked()
    set({ user, unlocked: true, error: null })
    return true
  },

  lock: () => {
    markLocked()
    set({ unlocked: false })
  },

  logout: () => {
    markLocked()
    set({ unlocked: false })
  },

  clearError: () => set({ error: null }),
}))
