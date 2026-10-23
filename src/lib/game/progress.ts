/** Folds a finished set into lifetime progress: XP, level, history and badges. */
import type { RepResult } from '../pose/coach'
import type { SavedData } from '../storage'
import { mostCommonFault } from '../voice/script'
import { newlyUnlocked, type Achievement, type SetRecord } from './achievements'
import { Combo } from './combo'
import { computeStreak } from './streak'
import { levelFromXp, repXp, setBonus } from './xp'

export interface SetOutcome {
  data: SavedData
  record: SetRecord
  xp: { reps: number; completed: number; perfect: number; total: number }
  levelBefore: number
  levelAfter: number
  badges: Achievement[]
}

/** Returns the new saved data plus what changed. A set with no reps isn't recorded. */
export function recordSet(data: SavedData, reps: RepResult[], now = new Date()): SetOutcome | null {
  if (!reps.length) return null
  const combo = new Combo()
  let repsXp = 0
  for (const r of reps) repsXp += repXp(r, combo.push(r))
  const bonus = setBonus(reps)
  const total = repsXp + bonus.completed + bonus.perfect

  const good = reps.filter((r) => r.valid).length
  const record: SetRecord = {
    id: `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    date: now.toISOString(),
    reps,
    good,
    total: reps.length,
    average: Math.round(reps.reduce((a, r) => a + r.score, 0) / reps.length),
    bestCombo: combo.best,
    xp: total,
    mainFault: mostCommonFault(reps),
  }

  const sets = [...data.sets, record]
  const xp = data.xp + total
  const levelAfter = levelFromXp(xp).level
  const streak = computeStreak(
    sets.map((s) => new Date(s.date)),
    now,
  ).current
  const badges = newlyUnlocked({ sets, level: levelAfter, streak }, data.unlocked)

  return {
    data: { ...data, sets, xp, unlocked: [...data.unlocked, ...badges.map((b) => b.id)] },
    record,
    xp: { reps: repsXp, ...bonus, total },
    levelBefore: levelFromXp(data.xp).level,
    levelAfter,
    badges,
  }
}
