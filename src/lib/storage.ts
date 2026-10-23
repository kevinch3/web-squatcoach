/**
 * Versioned localStorage. Everything the app remembers lives under one key.
 * Falls back to memory when storage is unavailable (private mode, blocked site data).
 */
import type { SetRecord } from './game/achievements'

export const STORAGE_KEY = 'squatcoach:v1'

export interface SavedData {
  version: 1
  sets: SetRecord[]
  unlocked: string[]
  xp: number
}

export const emptyData = (): SavedData => ({ version: 1, sets: [], unlocked: [], xp: 0 })

let memory: SavedData | null = null

export function load(): SavedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as SavedData
      if (data.version === 1) return { ...emptyData(), ...data }
    }
  } catch {
    // fall through to memory
  }
  return memory ?? emptyData()
}

export function save(data: SavedData) {
  memory = data
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // kept in memory only
  }
}
