/** Synthetic poses and angle sequences for driving the engine without a camera. */
import { LANDMARK_COUNT, SIDES, type Pose, type Pt } from '../src/lib/pose/landmarks'

export const FPS = 30
export const FRAME_H = 1080

const DEG = Math.PI / 180

/**
 * A side-view pose (right side facing the camera, left side hidden) with the
 * given knee angle, torso lean from vertical and heel rise (fraction of shin).
 */
export function sidePose(knee: number, lean = 15, heelRise = 0): Pose {
  const shin = 200
  const ankle: Pt = [500, 900, 0.95]
  const kneeP: Pt = [500, 900 - shin, 0.95]
  const hip: Pt = [
    kneeP[0] - Math.sin(knee * DEG) * 200,
    kneeP[1] + Math.cos(knee * DEG) * 200,
    0.95,
  ]
  const shoulder: Pt = [
    hip[0] + Math.sin(lean * DEG) * 250,
    hip[1] - Math.cos(lean * DEG) * 250,
    0.95,
  ]
  const heel: Pt = [470, 910 - heelRise * shin, 0.95]
  const foot: Pt = [560, 910, 0.95]
  const elbow: Pt = [shoulder[0] + 60, shoulder[1] + 80, 0.9]
  const wrist: Pt = [shoulder[0] + 120, shoulder[1] + 40, 0.9]

  const pose: Pose = Array.from({ length: LANDMARK_COUNT }, () => [500, 200, 0.9] as Pt)
  pose[0] = [shoulder[0], shoulder[1] - 120, 0.95]
  const near = { shoulder, elbow, wrist, hip, knee: kneeP, ankle, heel, foot }
  for (const [name, p] of Object.entries(near) as [keyof typeof near, Pt][]) {
    pose[SIDES.right[name]] = p
    pose[SIDES.left[name]] = [p[0] + 8, p[1], 0.2] // far side: hidden, low visibility
  }
  return pose
}

export interface Phase {
  /** Knee angle at the end of the phase (linear from the previous value). */
  to: number
  seconds: number
}

/** Expand phases into one knee angle per frame. */
export function kneeCurve(start: number, phases: Phase[], fps = FPS): number[] {
  const out: number[] = []
  let from = start
  for (const { to, seconds } of phases) {
    const n = Math.max(1, Math.round(seconds * fps))
    for (let i = 1; i <= n; i++) out.push(from + ((to - from) * i) / n)
    from = to
  }
  return out
}

/** Stand 0.5 s, lower to `depth` over `down` s (timed from 175°; the coach times from 160°), hold, rise over 0.8 s, stand 0.5 s. */
export function squat(depth = 85, down = 1.5): Phase[] {
  return [
    { to: 175, seconds: 0.5 },
    { to: depth, seconds: down },
    { to: depth, seconds: 0.2 },
    { to: 175, seconds: 0.8 },
    { to: 175, seconds: 0.5 },
  ]
}
