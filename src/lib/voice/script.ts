/**
 * The coach's script, written live as the set happens. Streaming port of
 * lines_for_person / summary_line in the original step4_voice_coach.py:
 *  - shouts corrections DURING the rep, the moment a fault shows up ("Chest up!")
 *  - counts good reps in rhythm, and notices patterns ("Deepest one yet!",
 *    "Three clean in a row!", "You're speeding up, control it")
 *  - says "no rep" briefly when it already told you why
 *  - closes with a set summary and the one thing to work on
 */
import type { RepResult } from '../pose/coach'
import { PERFECT_SCORE, type Fault } from '../pose/rules'
import { capitalize, FIX, FOCUS, NO_REP, pick, PRAISE, sayNumber, SHOUT, TIP } from './phrases'

/** 1 = nice to have, 2 = rep count, 3 = correction, 4 = always said */
export type Priority = 1 | 2 | 3 | 4

export interface Line {
  timeS: number
  priority: Priority
  text: string
}

type CounterKey = 'shout' | 'norep' | 'fix' | 'tip' | 'praise'

class PersonScript {
  good = 0
  streak = 0
  deepest: number | null = null
  firstDescent: number | null = null
  lastTip = new Map<Fault, number>() // fault -> the good-rep number it was last mentioned on
  shoutedThisRep = false

  constructor(readonly person: number) {}
}

export class CoachScript {
  private counter: Record<CounterKey, number> = { shout: 0, norep: 0, fix: 0, tip: 0, praise: 0 }
  private people = new Map<number, PersonScript>()

  /** many = more than one person is training, so lines start with "Person N, ". */
  constructor(private many = false) {}

  private state(person: number): PersonScript {
    let s = this.people.get(person)
    if (!s) this.people.set(person, (s = new PersonScript(person)))
    return s
  }

  private who(person: number) {
    return this.many ? `Person ${person + 1}, ` : ''
  }

  private next(key: CounterKey) {
    return this.counter[key]++
  }

  start(timeS: number): Line {
    return { timeS, priority: 1, text: "Alright, let's go." }
  }

  /** A fault just appeared mid-rep. Only the first shoutable fault of a rep is shouted. */
  liveFault(person: number, fault: Fault, timeS: number): Line | null {
    const s = this.state(person)
    const options = SHOUT[fault]
    if (!options || s.shoutedThisRep) return null
    s.shoutedThisRep = true
    return { timeS, priority: 3, text: this.who(person) + pick(options, this.next('shout')) }
  }

  /** A rep just finished. */
  rep(person: number, rep: RepResult): Line {
    const s = this.state(person)
    const who = this.who(person)
    const m = rep.measured
    s.shoutedThisRep = false
    s.firstDescent ??= m.tempo ?? 0
    const shouted = rep.liveFaults.find((lf) => SHOUT[lf.fault])?.fault ?? null
    const fault = rep.mainFault

    if (!rep.valid) {
      s.streak = 0
      let text: string
      if (shouted && shouted === fault) {
        text = pick(NO_REP, this.counter.norep) // reason already given
      } else {
        text = `${pick(NO_REP, this.counter.norep)} ${pick(FIX[fault ?? 'none'], this.next('fix'))}`
      }
      this.counter.norep++
      return { timeS: rep.timeS, priority: 3, text: who + text }
    }

    s.good++
    s.streak = rep.score >= PERFECT_SCORE ? s.streak + 1 : 0
    const count = who ? sayNumber(s.good) : capitalize(sayNumber(s.good))
    const depth = m.depth ?? 180

    let text: string
    let priority: Priority = 2
    if (fault === 'tempo' && s.good > 2 && (m.tempo ?? 0) < s.firstDescent * 0.7) {
      text = `${count}. You're speeding up, control it.`
      priority = 3
    } else if (fault && fault !== shouted && s.good - (s.lastTip.get(fault) ?? -9) >= 3) {
      s.lastTip.set(fault, s.good) // don't nag: once every 3 reps at most
      text = `${count}, ${pick(TIP[fault], this.next('tip'))}`
    } else if (s.deepest !== null && depth < s.deepest - 5) {
      text = `${count}. Deepest one yet!`
    } else if (s.streak === 3) {
      text = `${count}. Three clean in a row!`
    } else if (s.good % 2 === 0) {
      text = `${count}.` // every other rep: just the count
    } else {
      text = `${count}. ${pick(PRAISE, this.next('praise'))}`
    }
    if (this.many && priority === 2) priority = 1 // two people: corrections matter more
    s.deepest = s.deepest === null ? depth : Math.min(s.deepest, depth)
    return { timeS: rep.timeS, priority, text: who + text }
  }
}

/** Most common main fault across the reps, or null if every rep was clean. */
export function mostCommonFault(reps: RepResult[]): Fault | null {
  const counts = new Map<Fault, number>()
  for (const r of reps) if (r.mainFault) counts.set(r.mainFault, (counts.get(r.mainFault) ?? 0) + 1)
  let best: Fault | null = null
  for (const [f, n] of counts) if (best === null || n > counts.get(best)!) best = f
  return best
}

/** End-of-set line. people[i] = that person's reps. */
export function summaryLine(people: RepResult[][]): string {
  const withReps = people.filter((reps) => reps.length)
  if (!withReps.length) return 'Set done.'
  const good = (reps: RepResult[]) => reps.filter((r) => r.valid).length
  let text: string
  if (withReps.length === 1) {
    const reps = withReps[0]
    text = `Set done. ${capitalize(sayNumber(good(reps)))} clean out of ${sayNumber(reps.length)}.`
  } else {
    const parts = people
      .map((reps, i) =>
        reps.length
          ? `Person ${i + 1}, ${sayNumber(good(reps))} out of ${sayNumber(reps.length)}.`
          : '',
      )
      .filter(Boolean)
    text = 'Set done. ' + parts.join(' ')
  }
  const fault = mostCommonFault(withReps.flat())
  const averages = withReps.map((reps) =>
    Math.round(reps.reduce((a, r) => a + r.score, 0) / reps.length),
  )
  if (fault) text += ` Next set, focus on ${FOCUS[fault]}.`
  else if (Math.min(...averages) >= 90) text += ' That was a great set.'
  return text
}
