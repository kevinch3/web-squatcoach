/**
 * Every threshold the coach uses, in one place so they're easy to tune.
 * Values match the original Python project (step3_form_score.py).
 */

export const UP_ANGLE = 160 // knee angle above this = standing (rep ends)
export const DOWN_ANGLE = 100 // knee angle below this = at depth (rep counted)

/** [points, value where losing starts, value where all points are lost] */
export type Rule = readonly [points: number, start: number, end: number]

export const SIDE_RULES = {
  depth: [35, 90.0, 115.0], // knee angle at the bottom, degrees
  lean: [25, 45.0, 65.0], // max torso lean from vertical, degrees
  heels: [15, 0.06, 0.18], // heel rise as a fraction of shin length
  tempo: [25, 1.0, 0.4], // lowering time, seconds (less = worse)
} as const satisfies Record<string, Rule>

export const FRONT_RULES = {
  depth: [40, 90.0, 115.0], // depth from hip drop, as an equivalent angle
  knees: [35, 0.9, 0.65], // knee gap / ankle gap (less = caving in)
  tempo: [25, 1.0, 0.4],
} as const satisfies Record<string, Rule>

export type Fault = 'depth' | 'lean' | 'heels' | 'knees' | 'tempo'
export const LOWER_IS_WORSE = new Set<Fault>(['tempo', 'knees'])

// A rep only counts as GOOD if it passes all of these; otherwise it's a "no rep"
export const NO_REP_SCORE = 70
export const NO_REP_LEAN = 60.0 // side: leaning further than this
export const NO_REP_HEELS = 0.15 // side: heels lifting more than this
export const NO_REP_KNEES = 0.75 // front: knee gap below 75% of ankle gap
export const SHALLOW_ANGLE = 135 // a dip below this that never hits depth = half squat

export const LIVE_LEAN_LIMIT = 50.0 // torso turns red live past this
export const LIVE_HEEL_LIMIT = 0.1 // feet turn red live past this
export const LIVE_KNEE_LIMIT = 0.8 // legs turn red live below this (front view)
export const KNEE_JUDGE_ANGLE = 140 // knees are only judged once this bent (front view)

// Ignore detections that aren't a clearly visible full body (posters, reflections...)
export const MIN_BODY_VISIBILITY = 0.6
export const MIN_BODY_HEIGHT = 0.25 // shoulders-to-ankles, as a fraction of frame height
export const MIN_SEEN_SECONDS = 1.0 // a person's card appears only after this long

export const PARALLEL_ANGLE = 90 // full depth
export const PERFECT_SCORE = 85 // "great rep" colour / perfect-rep effects
export const OK_SCORE = 65 // below this a score shows red

export const CUES: Record<Fault | 'none', string> = {
  depth: 'Go a little deeper',
  lean: 'Keep your chest up',
  heels: 'Keep your heels down',
  knees: 'Push your knees out',
  tempo: 'Slow down on the way down',
  none: 'Great rep',
}

export type ScoreBand = 'good' | 'ok' | 'bad'
export const scoreBand = (score: number): ScoreBand =>
  score >= PERFECT_SCORE ? 'good' : score >= OK_SCORE ? 'ok' : 'bad'
