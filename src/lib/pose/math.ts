/** Shared helpers: smoothing, near-side selection and joint angles. */
import { joint, SIDE_NAMES, SIDES, type JointName, type Pose, type Side } from './landmarks'

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

const RAD = 180 / Math.PI

/** Angle at point b (degrees) formed by points a-b-c. */
export function angle(a: readonly number[], b: readonly number[], c: readonly number[]): number {
  const bax = a[0] - b[0]
  const bay = a[1] - b[1]
  const bcx = c[0] - b[0]
  const bcy = c[1] - b[1]
  const cos = (bax * bcx + bay * bcy) / (Math.hypot(bax, bay) * Math.hypot(bcx, bcy) + 1e-6)
  return Math.acos(clamp(cos, -1, 1)) * RAD
}

/** Midpoint of the left and right joint. */
export function mid(pose: Pose, name: JointName): [number, number] {
  const l = joint(pose, 'left', name)
  const r = joint(pose, 'right', name)
  return [(l[0] + r[0]) / 2, (l[1] + r[1]) / 2]
}

/**
 * Exponential moving average on landmark positions, to stop jitter.
 * alpha near 1 = follows quickly, near 0 = very smooth but laggy.
 */
export class Smoother {
  private state: Pose | null = null

  constructor(private alpha = 0.5) {}

  apply(pose: Pose): Pose {
    if (!this.state) {
      this.state = pose.map((p) => [...p])
    } else {
      const a = this.alpha
      this.state = this.state.map((s, i) => [
        a * pose[i][0] + (1 - a) * s[0],
        a * pose[i][1] + (1 - a) * s[1],
        pose[i][2],
      ])
    }
    return this.state
  }

  reset() {
    this.state = null
  }
}

/**
 * Picks the body side facing the camera. The far side is hidden in a
 * side-view video, so its points are guesses (that caused the 'ghost leg').
 * A margin stops the choice flipping back and forth every frame.
 */
export class SideChooser {
  static KEY_POINTS: JointName[] = ['shoulder', 'hip', 'knee', 'ankle']
  side: Side | null = null

  constructor(private margin = 0.1) {}

  apply(pose: Pose): Side {
    const score = sideVisibility(pose, SideChooser.KEY_POINTS)
    const best: Side = score.left >= score.right ? 'left' : 'right'
    if (this.side === null || score[best] > score[this.side] + this.margin) this.side = best
    return this.side
  }
}

/** Mean visibility of the given joints, per side. */
export function sideVisibility(pose: Pose, names: JointName[]): Record<Side, number> {
  const out = {} as Record<Side, number>
  for (const s of SIDE_NAMES) out[s] = mean(names.map((n) => pose[SIDES[s][n]][2]))
  return out
}
