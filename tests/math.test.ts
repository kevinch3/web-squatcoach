import { describe, expect, it } from 'vitest'
import { angle, median, SideChooser, Smoother } from '../src/lib/pose/math'
import { heelRise, isRealPerson, torsoLean } from '../src/lib/pose/measures'
import { FRAME_H, sidePose } from './helpers'

describe('angle', () => {
  it('measures the angle at the middle point (pixel-scale vectors)', () => {
    expect(angle([100, 0], [0, 0], [0, 100])).toBeCloseTo(90)
    expect(angle([-100, 0], [0, 0], [100, 0])).toBeCloseTo(180)
    expect(angle([100, 0], [0, 0], [100, 100])).toBeCloseTo(45)
  })
})

describe('median', () => {
  it('handles odd and even lengths', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })
})

describe('Smoother', () => {
  it('moves halfway towards each new point with alpha 0.5', () => {
    const s = new Smoother(0.5)
    s.apply([[0, 0, 1]])
    expect(s.apply([[10, 20, 0.5]])).toEqual([[5, 10, 0.5]])
    s.reset()
    expect(s.apply([[10, 20, 1]])).toEqual([[10, 20, 1]])
  })
})

describe('synthetic side pose', () => {
  const pose = sidePose(90, 30, 0.1)

  it('reads back the knee angle, lean and heel rise it was built with', () => {
    const near = new SideChooser().apply(pose)
    expect(near).toBe('right')
    expect(angle(pose[24], pose[26], pose[28])).toBeCloseTo(90, 1)
    expect(torsoLean(pose, 'right')).toBeCloseTo(30, 1)
    expect(heelRise(pose, 'right')).toBeCloseTo(0.1, 2)
  })

  it('counts as a real person', () => {
    expect(isRealPerson(pose, FRAME_H)).toBe(true)
    expect(
      isRealPerson(
        pose.map(([x, y]) => [x, y, 0.1]),
        FRAME_H,
      ),
    ).toBe(false)
  })
})
