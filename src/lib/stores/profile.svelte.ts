/** Lifetime progress: sets, XP, level, streak and unlocked badges. */
import { ACHIEVEMENTS } from '../game/achievements'
import { recordSet } from '../game/progress'
import { computeStreak } from '../game/streak'
import { levelFromXp } from '../game/xp'
import type { RepResult } from '../pose/coach'
import { load, save } from '../storage'

class Profile {
  data = $state(load())

  level = $derived(levelFromXp(this.data.xp))
  streak = $derived(computeStreak(this.data.sets.map((s) => new Date(s.date))))
  unlocked = $derived(new Set(this.data.unlocked))
  lifetimeGoodReps = $derived(this.data.sets.reduce((n, s) => n + s.good, 0))
  achievementCount = $derived(`${this.data.unlocked.length}/${ACHIEVEMENTS.length}`)

  /** Saves a finished set and returns what it earned (null if there were no reps). */
  addSet(reps: RepResult[]) {
    const outcome = recordSet($state.snapshot(this.data), reps)
    if (outcome) {
      this.data = outcome.data
      save(outcome.data)
    }
    return outcome
  }
}

export const profile = new Profile()
