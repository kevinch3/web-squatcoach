/**
 * One set of squats for up to N people: filters out false detections, keeps people
 * in a stable left-to-right order and turns frames into rep and fault events.
 * Pure, like the rest of the engine.
 */
import type { RepResult } from './coach'
import type { Pose } from './landmarks'
import { isRealPerson } from './measures'
import { PersonTracker, type FrameAnalysis } from './person'
import { MIN_SEEN_SECONDS, type Fault } from './rules'

export type SetEvent =
  | { type: 'rep'; person: number; rep: RepResult }
  | { type: 'fault'; person: number; fault: Fault; timeS: number }

export interface SetFrame {
  /** One entry per tracked slot; null when that person isn't in this frame. */
  people: (FrameAnalysis | null)[]
  events: SetEvent[]
}

const hipX = (p: Pose) => (p[23][0] + p[24][0]) / 2

export class SquatSet {
  readonly people: PersonTracker[]

  constructor(readonly maxPeople = 1) {
    this.people = Array.from({ length: maxPeople }, (_, i) => new PersonTracker(i))
  }

  update(bodies: Pose[], t: number, frameHeight: number): SetFrame {
    const real = bodies
      .filter((b) => isRealPerson(b, frameHeight))
      .sort((a, b) => hipX(a) - hipX(b)) // left to right
    const events: SetEvent[] = []
    const people = this.people.map((person, i) => {
      const body = real[i]
      if (!body) {
        person.lost()
        return null
      }
      const frame = person.update(body, t)
      for (const fault of frame.newFaults)
        events.push({ type: 'fault', person: i, fault, timeS: t })
      if (frame.rep) events.push({ type: 'rep', person: i, rep: frame.rep })
      return frame
    })
    return { people, events }
  }

  /** People tracked long enough to be real (their card shows). */
  shown(t: number): PersonTracker[] {
    return this.people.filter((p) => p.seenFor(t) >= MIN_SEEN_SECONDS)
  }

  /** Every person's reps, indexed by person. */
  reps(): RepResult[][] {
    return this.people.map((p) => p.coach.reps)
  }
}
