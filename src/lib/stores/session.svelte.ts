/**
 * The set in progress: countdown, live HUD numbers, rep toasts, and saving the set
 * when it finishes. The camera loop calls frame() for every video frame.
 */
import { Combo } from '../game/combo'
import type { SetOutcome } from '../game/progress'
import type { RepResult } from '../pose/coach'
import type { Pose, View } from '../pose/landmarks'
import { SquatSet, type SetFrame } from '../pose/set'
import { profile } from './profile.svelte'

export type SetStatus = 'idle' | 'countdown' | 'active' | 'done'

export interface PersonHud {
  index: number
  good: number
  attempts: number
  lastScore: number | null
  average: number | null
  stage: 'UP' | 'DOWN'
  view: View
  knee: number | null
  combo: number
}

export interface RepToast {
  id: number
  person: number
  rep: RepResult
}

export interface TimedRep {
  person: number
  rep: RepResult
}

const COUNTDOWN_S = 3
const TOAST_MS = 1800

class Session {
  status = $state<SetStatus>('idle')
  countdown = $state(0)
  /** People tracked long enough to show a card. */
  people = $state<PersonHud[]>([])
  toasts = $state<RepToast[]>([])
  /** Every rep this set, in the order they finished. */
  reps = $state<TimedRep[]>([])
  outcome = $state<SetOutcome | null>(null)
  maxPeople = $state(1)
  /** Camera on and pose model loaded. */
  cameraReady = $state(false)

  private set = new SquatSet(1)
  private combos: Combo[] = []
  private toastId = 0
  private timers: ReturnType<typeof setTimeout>[] = []

  /** Feed one camera frame. Reps only count while a set is active. */
  frame(bodies: Pose[], t: number, frameHeight: number): SetFrame {
    const out = this.set.update(bodies, t, frameHeight)
    if (this.status === 'active') {
      for (const e of out.events) if (e.type === 'rep') this.onRep(e.person, e.rep)
    }
    this.people = this.set.shown(t).map((p) => ({
      index: p.index,
      good: p.coach.goodReps,
      attempts: p.coach.reps.length,
      lastScore: p.coach.reps.at(-1)?.score ?? null,
      average: p.coach.average,
      stage: p.coach.stage,
      view: p.view,
      knee: p.knee,
      combo: this.combos[p.index]?.count ?? 0,
    }))
    return out
  }

  private onRep(person: number, rep: RepResult) {
    this.combos[person]?.push(rep)
    this.reps.push({ person, rep })
    const id = ++this.toastId
    this.toasts = [...this.toasts.filter((x) => x.person !== person), { id, person, rep }]
    this.later(() => (this.toasts = this.toasts.filter((x) => x.id !== id)), TOAST_MS)
  }

  /** 3-2-1, then a fresh set starts counting. */
  start() {
    this.clearTimers()
    this.outcome = null
    this.status = 'countdown'
    this.countdown = COUNTDOWN_S
    for (let i = 1; i <= COUNTDOWN_S; i++) {
      this.later(() => {
        this.countdown = COUNTDOWN_S - i
        if (i === COUNTDOWN_S) this.begin()
      }, i * 1000)
    }
  }

  private begin() {
    this.set = new SquatSet(this.maxPeople)
    this.combos = Array.from({ length: this.maxPeople }, () => new Combo())
    this.reps = []
    this.toasts = []
    this.status = 'active'
  }

  /** Ends the set and saves it. Returns to idle if no reps were done. */
  finish() {
    this.clearTimers()
    if (this.status !== 'active') {
      this.status = 'idle'
      return
    }
    const reps = $state.snapshot(this.reps).map((r) => r.rep)
    this.outcome = profile.addSet(reps)
    this.status = this.outcome ? 'done' : 'idle'
  }

  /** Back to the camera preview after the summary. */
  reset() {
    this.clearTimers()
    this.status = 'idle'
    this.outcome = null
    this.reps = []
    this.toasts = []
    this.set = new SquatSet(this.maxPeople)
  }

  private later(fn: () => void, ms: number) {
    this.timers.push(setTimeout(fn, ms))
  }

  private clearTimers() {
    this.timers.forEach(clearTimeout)
    this.timers = []
  }
}

export const session = new Session()
