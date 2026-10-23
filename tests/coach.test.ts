import { describe, expect, it } from 'vitest'
import { penalty, SquatCoach, type RepResult } from '../src/lib/pose/coach'
import type { View } from '../src/lib/pose/landmarks'
import { PersonTracker } from '../src/lib/pose/person'
import { SIDE_RULES } from '../src/lib/pose/rules'
import { FPS, kneeCurve, sidePose, squat, type Phase } from './helpers'

interface Extra {
  view?: View
  lean?: number
  heel?: number
  kneeRatio?: number
}

function run(phases: Phase[], extra: Extra = {}): RepResult[] {
  const coach = new SquatCoach()
  const reps: RepResult[] = []
  kneeCurve(175, phases).forEach((knee, i) => {
    const rep = coach.update({ knee, t: i / FPS, view: extra.view ?? 'side', ...extra })
    if (rep) reps.push(rep)
  })
  return reps
}

describe('penalty', () => {
  it('is linear between start and end, clamped', () => {
    expect(penalty(90, SIDE_RULES.depth)).toBe(0)
    expect(penalty(102.5, SIDE_RULES.depth)).toBeCloseTo(17.5)
    expect(penalty(130, SIDE_RULES.depth)).toBe(35)
  })
  it('flips for rules where lower is worse', () => {
    expect(penalty(1.2, SIDE_RULES.tempo, true)).toBe(0)
    expect(penalty(0.7, SIDE_RULES.tempo, true)).toBeCloseTo(12.5)
    expect(penalty(0.2, SIDE_RULES.tempo, true)).toBe(25)
  })
})

describe('SquatCoach', () => {
  it('scores a clean, deep, controlled rep 100', () => {
    const reps = run(squat(85, 1.5), { lean: 20 })
    expect(reps).toHaveLength(1)
    const [r] = reps
    expect(r.valid).toBe(true)
    expect(r.score).toBe(100)
    expect(r.mainFault).toBeNull()
    expect(r.cue).toBe('Great rep')
    expect(r.measured.tempo).toBeGreaterThanOrEqual(1)
  })

  it('counts several reps', () => {
    const reps = run([...squat(), ...squat(), ...squat()], { lean: 20 })
    expect(reps.map((r) => r.rep)).toEqual([1, 2, 3])
  })

  it('calls a half squat a no rep for depth', () => {
    const reps = run(squat(120))
    expect(reps).toHaveLength(1)
    expect(reps[0].valid).toBe(false)
    expect(reps[0].mainFault).toBe('depth')
    expect(reps[0].cue).toBe('No rep. Go a little deeper')
  })

  it('ignores tiny dips that never get below the shallow angle', () => {
    expect(run(squat(145))).toHaveLength(0)
  })

  it('rejects a rep with too much forward lean and records the live fault', () => {
    const [r] = run(squat(85), { lean: 65 })
    expect(r.valid).toBe(false)
    expect(r.mainFault).toBe('lean')
    expect(r.liveFaults.map((f) => f.fault)).toContain('lean')
  })

  it('docks points for a rushed descent but still counts it', () => {
    const [r] = run(squat(85, 0.4), { lean: 20 })
    expect(r.valid).toBe(true)
    expect(r.mainFault).toBe('tempo')
    expect(r.score).toBeLessThan(85)
    expect(r.cue).toBe('Slow down on the way down')
  })

  it('rejects knees caving in from the front', () => {
    const [r] = run(squat(85), { view: 'front', kneeRatio: 0.6 })
    expect(r.view).toBe('front')
    expect(r.valid).toBe(false)
    expect(r.mainFault).toBe('knees')
  })

  it('reports the average and good-rep count', () => {
    const coach = new SquatCoach()
    kneeCurve(175, [...squat(85), ...squat(120)]).forEach((knee, i) =>
      coach.update({ knee, t: i / FPS, view: 'side', lean: 20 }),
    )
    expect(coach.reps).toHaveLength(2)
    expect(coach.goodReps).toBe(1)
    expect(coach.average).not.toBeNull()
  })
})

describe('PersonTracker (end to end on synthetic poses)', () => {
  it('detects the side view and counts reps from raw landmarks', () => {
    const p = new PersonTracker(0)
    const reps: RepResult[] = []
    kneeCurve(175, [...squat(85), ...squat(85)]).forEach((knee, i) => {
      const frame = p.update(sidePose(knee, 20), i / FPS)
      if (frame.rep) reps.push(frame.rep)
    })
    expect(p.view).toBe('side')
    expect(reps).toHaveLength(2)
    expect(reps.every((r) => r.valid)).toBe(true)
    expect(p.series.length).toBeGreaterThan(0)
  })

  it('emits a live fault the moment the heels lift', () => {
    const p = new PersonTracker(0)
    const faults: string[] = []
    kneeCurve(175, squat(85)).forEach((knee, i) => {
      const heel = knee < 100 ? 0.2 : 0
      faults.push(...p.update(sidePose(knee, 20, heel), i / FPS).newFaults)
    })
    expect(faults).toEqual(['heels'])
  })
})
