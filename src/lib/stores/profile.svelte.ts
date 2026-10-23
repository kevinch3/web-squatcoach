/** Lifetime progress: sets, XP, level, streak and unlocked badges. */
import { ACHIEVEMENTS } from '../game/achievements'
import { computeStreak } from '../game/streak'
import { levelFromXp } from '../game/xp'
import { load } from '../storage'

class Profile {
  data = $state(load())

  level = $derived(levelFromXp(this.data.xp))
  streak = $derived(computeStreak(this.data.sets.map((s) => new Date(s.date))))
  unlocked = $derived(new Set(this.data.unlocked))
  lifetimeGoodReps = $derived(this.data.sets.reduce((n, s) => n + s.good, 0))
  achievementCount = $derived(`${this.data.unlocked.length}/${ACHIEVEMENTS.length}`)
}

export const profile = new Profile()
