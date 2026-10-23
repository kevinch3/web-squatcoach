import { describe, expect, it } from 'vitest'
import { recordSet } from '../src/lib/game/progress'
import type { Pose } from '../src/lib/pose/landmarks'
import { SquatSet } from '../src/lib/pose/set'
import { emptyData } from '../src/lib/storage'
import { FPS, FRAME_H, kneeCurve, sidePose, squat } from './helpers'

const shift = (pose: Pose, dx: number): Pose => pose.map(([x, y, v]) => [x + dx, y, v])

describe('SquatSet', () => {
  it('turns frames into rep events and shows a person after a second', () => {
    const set = new SquatSet(1)
    const reps = []
    const curve = kneeCurve(175, [...squat(), ...squat()])
    curve.forEach((knee, i) => {
      for (const e of set.update([sidePose(knee, 20)], i / FPS, FRAME_H).events)
        if (e.type === 'rep') reps.push(e.rep)
    })
    expect(reps).toHaveLength(2)
    expect(set.shown(curve.length / FPS)).toHaveLength(1)
    expect(set.shown(0.5)).toHaveLength(0)
  })

  it('emits fault events mid-rep', () => {
    const set = new SquatSet(1)
    const faults: string[] = []
    kneeCurve(175, squat()).forEach((knee, i) => {
      for (const e of set.update([sidePose(knee, 55)], i / FPS, FRAME_H).events)
        if (e.type === 'fault') faults.push(e.fault)
    })
    expect(faults).toEqual(['lean'])
  })

  it('ignores detections that are not a clearly visible full body', () => {
    const set = new SquatSet(1)
    const ghost = sidePose(175).map(([x, y]) => [x, y, 0.1] as [number, number, number])
    const frame = set.update([ghost], 0, FRAME_H)
    expect(frame.people).toEqual([null])
  })

  it('keeps two people in left-to-right order', () => {
    const set = new SquatSet(2)
    const right = shift(sidePose(175), 600)
    const left = sidePose(120)
    const frame = set.update([right, left], 0, FRAME_H)
    expect(frame.people[0]!.knee).toBeCloseTo(120, 0)
    expect(frame.people[1]!.knee).toBeCloseTo(175, 0)
  })
})

describe('recordSet', () => {
  const reps = () => {
    const set = new SquatSet(1)
    kneeCurve(175, [...squat(), ...squat(), ...squat(), ...squat(), ...squat()]).forEach((k, i) =>
      set.update([sidePose(k, 20)], i / FPS, FRAME_H),
    )
    return set.reps()[0]
  }

  it('awards XP, saves history and unlocks badges', () => {
    const out = recordSet(emptyData(), reps(), new Date(2026, 9, 23))!
    expect(out.record.total).toBe(5)
    expect(out.record.good).toBe(5)
    expect(out.record.bestCombo).toBe(5)
    // 10 + 10 + 15 + 15 + 20 for the combo, plus the set and perfect-set bonuses
    expect(out.xp).toEqual({ reps: 70, completed: 25, perfect: 50, total: 145 })
    expect(out.levelBefore).toBe(1)
    expect(out.levelAfter).toBe(2)
    expect(out.data.sets).toHaveLength(1)
    expect(out.data.unlocked).toEqual(
      expect.arrayContaining(['first-rep', 'clean-set', 'flawless']),
    )
  })

  it('does not record an empty set or re-unlock badges', () => {
    expect(recordSet(emptyData(), [])).toBeNull()
    const first = recordSet(emptyData(), reps())!
    const second = recordSet(first.data, reps())!
    expect(second.badges.map((b) => b.id)).not.toContain('first-rep')
    expect(second.data.sets).toHaveLength(2)
  })
})
