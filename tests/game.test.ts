import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS, newlyUnlocked, type SetRecord } from '../src/lib/game/achievements'
import { Combo, comboMultiplier } from '../src/lib/game/combo'
import { computeStreak } from '../src/lib/game/streak'
import { levelFromXp, repXp, setBonus, xpForLevel } from '../src/lib/game/xp'
import type { RepResult } from '../src/lib/pose/coach'

const rep = (score: number, valid = true): RepResult => ({
  rep: 1,
  startS: 0,
  bottomS: 1,
  timeS: 2,
  liveFaults: [],
  view: 'side',
  score,
  valid,
  measured: { depth: 85, lean: 20 },
  pointsLost: {},
  mainFault: null,
  cue: '',
})

describe('xp', () => {
  it('gives score/10 per valid rep times the combo multiplier', () => {
    expect(repXp(rep(92), 1)).toBe(9)
    expect(repXp(rep(92), 3)).toBe(14) // 9 * 1.5 = 13.5
    expect(repXp(rep(100), 10)).toBe(30)
    expect(repXp(rep(92, false), 5)).toBe(0)
  })

  it('adds set bonuses', () => {
    expect(setBonus([rep(95), rep(95)])).toEqual({ completed: 0, perfect: 0 })
    expect(setBonus(Array(5).fill(rep(95)))).toEqual({ completed: 25, perfect: 50 })
    expect(setBonus([...Array(4).fill(rep(95)), rep(50, false)]).perfect).toBe(0)
  })

  it('turns lifetime XP into levels', () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, into: 0, needed: 100 })
    expect(levelFromXp(99).level).toBe(1)
    expect(levelFromXp(100)).toMatchObject({ level: 2, into: 0, needed: xpForLevel(2) })
    expect(levelFromXp(100 + xpForLevel(2) + 5)).toMatchObject({ level: 3, into: 5 })
  })
})

describe('combo', () => {
  it('builds on valid reps and breaks on a no rep', () => {
    const c = new Combo()
    ;[rep(90), rep(90), rep(90)].forEach((r) => c.push(r))
    expect(c.count).toBe(3)
    expect(c.multiplier).toBe(1.5)
    c.push(rep(40, false))
    expect(c.count).toBe(0)
    expect(c.best).toBe(3)
    expect([1, 3, 5, 10].map(comboMultiplier)).toEqual([1, 1.5, 2, 3])
  })
})

describe('streak', () => {
  const day = (d: number) => new Date(2026, 9, d, 18)

  it('counts consecutive days up to today', () => {
    expect(computeStreak([day(20), day(21), day(23)], day(23))).toEqual({
      current: 1,
      best: 2,
      today: true,
    })
    expect(computeStreak([day(21), day(22), day(23)], day(23)).current).toBe(3)
  })

  it('stays alive until the end of today', () => {
    expect(computeStreak([day(21), day(22)], day(23))).toMatchObject({ current: 2, today: false })
    expect(computeStreak([day(20), day(21)], day(23)).current).toBe(0)
  })

  it('works across month boundaries', () => {
    const dates = [new Date(2026, 8, 30), new Date(2026, 9, 1)]
    expect(computeStreak(dates, new Date(2026, 9, 1)).current).toBe(2)
  })
})

describe('achievements', () => {
  const set = (reps: RepResult[], bestCombo = 0): SetRecord => ({
    id: 'x',
    date: new Date().toISOString(),
    reps,
    good: reps.filter((r) => r.valid).length,
    total: reps.length,
    average: Math.round(reps.reduce((a, r) => a + r.score, 0) / reps.length),
    bestCombo,
    xp: 0,
    mainFault: null,
  })

  it('has unique ids', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
  })

  it('unlocks only what is new', () => {
    const stats = { sets: [set(Array(5).fill(rep(100)), 5)], level: 1, streak: 1 }
    const ids = newlyUnlocked(stats, ['first-rep']).map((a) => a.id)
    expect(ids).toEqual(expect.arrayContaining(['clean-set', 'perfect-100', 'flawless']))
    expect(ids).not.toContain('first-rep')
    expect(ids).not.toContain('combo-10')
  })
})
