/** XP and levels. */
import type { RepResult } from '../pose/coach'
import { comboMultiplier } from './combo'

export const SET_BONUS_MIN_REPS = 5
export const SET_BONUS_XP = 25
export const PERFECT_SET_BONUS_XP = 50
export const PERFECT_SET_AVG = 90

/** XP for one rep at the given combo (number of valid reps in a row, including this one). */
export function repXp(rep: RepResult, combo: number): number {
  if (!rep.valid) return 0
  return Math.round(Math.round(rep.score / 10) * comboMultiplier(combo))
}

export interface SetBonus {
  completed: number
  perfect: number
}

export function setBonus(reps: RepResult[]): SetBonus {
  if (reps.length < SET_BONUS_MIN_REPS) return { completed: 0, perfect: 0 }
  const avg = reps.reduce((a, r) => a + r.score, 0) / reps.length
  const perfect = reps.every((r) => r.valid) && avg >= PERFECT_SET_AVG
  return { completed: SET_BONUS_XP, perfect: perfect ? PERFECT_SET_BONUS_XP : 0 }
}

/** Total XP needed to go from level n to level n + 1. */
export const xpForLevel = (n: number) => Math.round(100 * n ** 1.5)

export interface LevelInfo {
  level: number
  /** XP earned inside the current level. */
  into: number
  /** XP needed to finish the current level. */
  needed: number
  progress: number
}

/** Turns lifetime XP into a level (starting at 1) and progress through it. */
export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1
  let rest = Math.max(0, totalXp)
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level)
    level++
  }
  const needed = xpForLevel(level)
  return { level, into: rest, needed, progress: rest / needed }
}
