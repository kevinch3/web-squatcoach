/** Camera-view detection and front-view depth. */
import type { Pose, View } from './landmarks'
import { clamp, median, mid, sideVisibility } from './math'
import { shoulderRatio } from './measures'

/**
 * Decides whether the camera sees this person from the front or the side.
 * Two thresholds so the view doesn't flicker between them.
 */
export class ViewDetector {
  view: View | null = null
  private history: number[] = []

  apply(pose: Pose): View {
    // One side clearly hidden = side view, whatever the shoulder width says
    const vis = sideVisibility(pose, ['shoulder', 'hip', 'knee', 'ankle'])
    const hiddenSide = Math.abs(vis.left - vis.right) > 0.3
    this.history.push(hiddenSide ? 0 : shoulderRatio(pose))
    if (this.history.length > 15) this.history.shift()
    const r = median(this.history)
    if (this.view === null) this.view = r > 0.5 ? 'front' : 'side'
    else if (this.view === 'side' && r > 0.6) this.view = 'front'
    else if (this.view === 'front' && r < 0.4) this.view = 'side'
    return this.view
  }
}

/**
 * Front-view depth. The knee angle can't be read from the front (the thigh
 * points at the camera), so we measure how far the hips drop instead and
 * convert it to an equivalent knee angle: standing = 180, hips level with
 * knees (about 55% of standing height) = 90.
 */
export class HipDrop {
  private recent: { t: number; height: number }[] = []

  constructor(private windowS = 4) {}

  apply(pose: Pose, t: number): number {
    const height = mid(pose, 'ankle')[1] - mid(pose, 'hip')[1]
    this.recent.push({ t, height })
    while (this.recent.length && this.recent[0].t < t - this.windowS) this.recent.shift()
    const standing = Math.max(...this.recent.map((r) => r.height))
    const ratio = height / (standing + 1e-6)
    return clamp(180 - 200 * (1 - ratio), 40, 180)
  }
}
