/** Combo: valid reps in a row. A no rep breaks it. */
import type { RepResult } from '../pose/coach'
import { PERFECT_SCORE } from '../pose/rules'

export function comboMultiplier(combo: number): number {
  if (combo >= 10) return 3
  if (combo >= 5) return 2
  if (combo >= 3) return 1.5
  return 1
}

export const isPerfect = (rep: RepResult) => rep.valid && rep.score >= PERFECT_SCORE

export class Combo {
  count = 0
  best = 0

  /** Returns the combo after this rep. */
  push(rep: RepResult): number {
    this.count = rep.valid ? this.count + 1 : 0
    this.best = Math.max(this.best, this.count)
    return this.count
  }

  get multiplier() {
    return comboMultiplier(this.count)
  }

  reset() {
    this.count = 0
    this.best = 0
  }
}
