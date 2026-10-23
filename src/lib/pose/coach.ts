/**
 * Counts reps and scores each one against the rules for its camera view.
 * Port of SquatCoach in the original step3_form_score.py; time is in seconds
 * instead of frame numbers, since a webcam has no fixed frame rate.
 */
import type { View } from './landmarks'
import { clamp, mean, median } from './math'
import {
  CUES,
  DOWN_ANGLE,
  FRONT_RULES,
  KNEE_JUDGE_ANGLE,
  LIVE_HEEL_LIMIT,
  LIVE_KNEE_LIMIT,
  LIVE_LEAN_LIMIT,
  LOWER_IS_WORSE,
  NO_REP_HEELS,
  NO_REP_KNEES,
  NO_REP_LEAN,
  NO_REP_SCORE,
  SHALLOW_ANGLE,
  SIDE_RULES,
  UP_ANGLE,
  type Fault,
  type Rule,
} from './rules'

export type Stage = 'UP' | 'DOWN'

export interface RepResult {
  rep: number
  startS: number
  bottomS: number
  timeS: number
  /** Moments a fault first appeared during the rep (the voice shouts these). */
  liveFaults: { fault: Fault; timeS: number }[]
  view: View
  score: number
  valid: boolean
  measured: Partial<Record<Fault, number>>
  pointsLost: Partial<Record<Fault, number>>
  mainFault: Fault | null
  cue: string
}

export interface FrameInput {
  knee: number
  t: number
  view: View
  lean?: number
  heel?: number
  kneeRatio?: number | null
}

const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d

/** Points lost, scaled linearly between the start and end of the rule. */
export function penalty(value: number, rule: Rule, lowerIsWorse = false): number {
  const points = rule[0]
  let [, start, end] = rule
  if (lowerIsWorse) [value, start, end] = [-value, -start, -end]
  return points * clamp((value - start) / (end - start), 0, 1)
}

export class SquatCoach {
  stage: Stage = 'UP'
  reps: RepResult[] = []
  /** Faults that first appeared during the latest update() (the voice shouts these). */
  newFaults: Fault[] = []
  private heelBaseline: number[] = []

  private repStart: number | null = null
  private minKnee = 180
  private bottomT = 0
  private maxLean = 0
  private maxHeel = 0
  private minKneeRatio = 9.9
  private frontFrames = 0
  private sideFrames = 0
  private live = new Map<Fault, number>() // fault -> first time it showed up mid-rep

  private resetRep() {
    this.repStart = null
    this.minKnee = 180
    this.bottomT = 0
    this.maxLean = 0
    this.maxHeel = 0
    this.minKneeRatio = 9.9
    this.frontFrames = this.sideFrames = 0
    this.live = new Map()
  }

  baseline(): number {
    return this.heelBaseline.length ? median(this.heelBaseline) : 0
  }

  /** Feed one frame. Returns the finished rep when a rep completes, else null. */
  update({ knee, t, view, lean = 0, heel = 0, kneeRatio = null }: FrameInput): RepResult | null {
    this.newFaults = []
    if (this.stage === 'UP' && knee >= UP_ANGLE) {
      let half: RepResult | null = null
      if (this.repStart !== null && this.minKnee < SHALLOW_ANGLE) {
        half = this.score(t) // a half squat
        this.reps.push(half)
      }
      if (view === 'side') this.heelBaseline = [...this.heelBaseline, heel].slice(-60)
      this.resetRep()
      return half
    }

    if (this.repStart === null) this.repStart = t
    if (knee < this.minKnee) {
      this.minKnee = knee
      this.bottomT = t
    }
    if (view === 'front') {
      this.frontFrames++
      if (kneeRatio != null && knee < KNEE_JUDGE_ANGLE) {
        this.minKneeRatio = Math.min(this.minKneeRatio, kneeRatio)
        if (kneeRatio < LIVE_KNEE_LIMIT) this.markLive('knees', t)
      }
    } else {
      this.sideFrames++
      this.maxLean = Math.max(this.maxLean, lean)
      this.maxHeel = Math.max(this.maxHeel, heel - this.baseline())
      if (lean > LIVE_LEAN_LIMIT) this.markLive('lean', t)
      if (this.stage === 'DOWN' && heel - this.baseline() > LIVE_HEEL_LIMIT)
        this.markLive('heels', t)
    }

    if (this.stage === 'UP' && knee < DOWN_ANGLE) {
      this.stage = 'DOWN'
    } else if (this.stage === 'DOWN' && knee >= UP_ANGLE) {
      this.stage = 'UP'
      const rep = this.score(t)
      this.reps.push(rep)
      this.resetRep()
      return rep
    }
    return null
  }

  private markLive(fault: Fault, t: number) {
    if (this.live.has(fault)) return
    this.live.set(fault, t)
    this.newFaults.push(fault)
  }

  private score(t: number): RepResult {
    const view: View = this.frontFrames > this.sideFrames ? 'front' : 'side'
    const start = this.repStart ?? t
    const measured: Partial<Record<Fault, number>> = {
      depth: this.minKnee,
      tempo: this.bottomT - start,
    }
    const rules: Partial<Record<Fault, Rule>> = view === 'side' ? SIDE_RULES : FRONT_RULES
    if (view === 'side') {
      measured.lean = this.maxLean
      measured.heels = this.maxHeel
    } else {
      measured.knees = this.minKneeRatio < 9 ? this.minKneeRatio : 1.0
    }

    const lost: Partial<Record<Fault, number>> = {}
    let worst: Fault | null = null
    for (const [k, rule] of Object.entries(rules) as [Fault, Rule][]) {
      lost[k] = penalty(measured[k]!, rule, LOWER_IS_WORSE.has(k))
      if (worst === null || lost[k]! > lost[worst]!) worst = k
    }
    if (worst !== null && lost[worst]! < 3) worst = null
    const score = Math.round(100 - Object.values(lost).reduce((a, b) => a + b, 0))

    // Hard failures, most serious first: these make it a "no rep"
    const broken: Fault[] = []
    if (this.minKnee >= DOWN_ANGLE) broken.push('depth')
    if (view === 'front' && measured.knees! < NO_REP_KNEES) broken.push('knees')
    if (view === 'side' && this.maxLean > NO_REP_LEAN) broken.push('lean')
    if (view === 'side' && this.maxHeel > NO_REP_HEELS) broken.push('heels')
    const valid = broken.length === 0 && score >= NO_REP_SCORE
    if (broken.length) worst = broken[0] !== 'depth' || broken.length === 1 ? broken[0] : broken[1]

    return {
      rep: this.reps.length + 1,
      startS: round(start, 2),
      bottomS: round(this.bottomT, 2),
      timeS: round(t, 2),
      liveFaults: [...this.live.entries()]
        .sort((a, b) => a[1] - b[1])
        .map(([fault, ft]) => ({ fault, timeS: round(ft, 2) })),
      view,
      score,
      valid,
      measured: Object.fromEntries(Object.entries(measured).map(([k, v]) => [k, round(v, 2)])),
      pointsLost: Object.fromEntries(Object.entries(lost).map(([k, v]) => [k, round(v, 1)])),
      mainFault: worst,
      cue: valid ? CUES[worst ?? 'none'] : `No rep. ${CUES[worst ?? 'depth']}`,
    }
  }

  get goodReps(): number {
    return this.reps.filter((r) => r.valid).length
  }

  get average(): number | null {
    return this.reps.length ? Math.round(mean(this.reps.map((r) => r.score))) : null
  }
}
