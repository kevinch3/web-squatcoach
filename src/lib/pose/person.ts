/**
 * Per-person pipeline: smooth -> detect view -> measure -> feed the coach.
 * Pure (no MediaPipe, no DOM) so it can be driven by recorded landmark data in tests.
 */
import { SquatCoach, type RepResult } from './coach'
import { joint, type Pose, type Side, type View } from './landmarks'
import { angle, SideChooser, Smoother } from './math'
import { heelRise, kneeRatio, torsoLean } from './measures'
import {
  KNEE_JUDGE_ANGLE,
  LIVE_HEEL_LIMIT,
  LIVE_KNEE_LIMIT,
  LIVE_LEAN_LIMIT,
  type Fault,
} from './rules'
import { HipDrop, ViewDetector } from './view'

export interface FrameAnalysis {
  pose: Pose // smoothed
  view: View
  side: Side | null // near side (side view only)
  knee: number // knee angle, or the hip-drop equivalent in front view
  lean: number | null
  heelUp: boolean
  leanBad: boolean
  kneesIn: boolean
  /** Faults that just showed up mid-rep. */
  newFaults: Fault[]
  rep: RepResult | null
}

export class PersonTracker {
  readonly coach = new SquatCoach()
  /** [time s, knee deg] every frame, for the live chart. */
  readonly series: [number, number][] = []
  firstSeen: number | null = null
  lastSeen: number | null = null
  knee: number | null = null
  view: View = 'side'

  private smoother = new Smoother(0.5)
  private sideChooser = new SideChooser()
  private viewDetector = new ViewDetector()
  private hipDrop = new HipDrop()

  constructor(readonly index: number) {}

  /** The person left the frame: drop smoothing state so they don't "slide" back in. */
  lost() {
    this.smoother.reset()
    this.knee = null
  }

  /** Seconds this person has been tracked. */
  seenFor(t: number): number {
    return this.firstSeen === null ? 0 : t - this.firstSeen
  }

  update(raw: Pose, t: number): FrameAnalysis {
    this.firstSeen ??= t
    this.lastSeen = t
    const pose = this.smoother.apply(raw)
    const view = (this.view = this.viewDetector.apply(pose))

    let out: FrameAnalysis
    if (view === 'side') {
      const side = this.sideChooser.apply(pose)
      const knee = angle(
        joint(pose, side, 'hip'),
        joint(pose, side, 'knee'),
        joint(pose, side, 'ankle'),
      )
      const lean = torsoLean(pose, side)
      const heel = heelRise(pose, side)
      const rep = this.coach.update({ knee, t, view, lean, heel })
      const heelUp = this.coach.stage === 'DOWN' && heel - this.coach.baseline() > LIVE_HEEL_LIMIT
      out = {
        pose,
        view,
        side,
        knee,
        lean,
        heelUp,
        leanBad: lean > LIVE_LEAN_LIMIT,
        kneesIn: false,
        newFaults: this.coach.newFaults,
        rep,
      }
    } else {
      const knee = this.hipDrop.apply(pose, t)
      const kr = kneeRatio(pose)
      const rep = this.coach.update({ knee, t, view, kneeRatio: kr })
      out = {
        pose,
        view,
        side: null,
        knee,
        lean: null,
        heelUp: false,
        leanBad: false,
        kneesIn: knee < KNEE_JUDGE_ANGLE && kr < LIVE_KNEE_LIMIT,
        newFaults: this.coach.newFaults,
        rep,
      }
    }
    this.knee = out.knee
    this.series.push([Math.round(t * 1000) / 1000, Math.round(out.knee * 10) / 10])
    return out
  }
}
