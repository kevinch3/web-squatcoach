import { describe, expect, it } from 'vitest'
import type { RepResult } from '../src/lib/pose/coach'
import type { Fault } from '../src/lib/pose/rules'
import { CoachScript, mostCommonFault, summaryLine } from '../src/lib/voice/script'

let n = 0
function rep(over: Partial<RepResult> = {}): RepResult {
  n++
  return {
    rep: n,
    startS: n,
    bottomS: n + 0.5,
    timeS: n + 1,
    liveFaults: [],
    view: 'side',
    score: 95,
    valid: true,
    measured: { depth: 88, tempo: 1.2, lean: 20, heels: 0 },
    pointsLost: {},
    mainFault: null,
    cue: 'Great rep',
    ...over,
  }
}

describe('CoachScript', () => {
  it('counts good reps in rhythm', () => {
    const s = new CoachScript()
    expect(s.rep(0, rep()).text).toBe('One. Nice.')
    expect(s.rep(0, rep()).text).toBe('Two.')
    expect(s.rep(0, rep()).text).toBe('Three. Three clean in a row!')
  })

  it('celebrates the deepest rep so far', () => {
    const s = new CoachScript()
    s.rep(0, rep({ measured: { depth: 95, tempo: 1.2 } }))
    expect(s.rep(0, rep({ measured: { depth: 80, tempo: 1.2 } })).text).toBe(
      'Two. Deepest one yet!',
    )
  })

  it('shouts the first fault mid-rep, once', () => {
    const s = new CoachScript()
    expect(s.liveFault(0, 'lean', 1)?.text).toBe('Chest up!')
    expect(s.liveFault(0, 'heels', 1.1)).toBeNull()
    expect(s.liveFault(0, 'depth', 1.1)).toBeNull()
  })

  it('keeps the no rep short when the reason was already shouted', () => {
    const s = new CoachScript()
    const live = [{ fault: 'lean' as Fault, timeS: 1 }]
    s.liveFault(0, 'lean', 1)
    const line = s.rep(0, rep({ valid: false, mainFault: 'lean', liveFaults: live }))
    expect(line).toMatchObject({ priority: 3, text: "That one doesn't count." })
  })

  it('explains a no rep that was not shouted', () => {
    const s = new CoachScript()
    const line = s.rep(0, rep({ valid: false, mainFault: 'depth' }))
    expect(line.text).toBe("That one doesn't count. You need to go lower.")
  })

  it('prefixes lines with the person when two people train', () => {
    const s = new CoachScript(true)
    const line = s.rep(1, rep())
    expect(line.text).toBe('Person 2, one. Nice.')
    expect(line.priority).toBe(1)
  })
})

describe('summary', () => {
  it('names the one thing to work on', () => {
    const reps = [rep(), rep({ mainFault: 'tempo' }), rep({ mainFault: 'tempo', valid: false })]
    expect(mostCommonFault(reps)).toBe('tempo')
    expect(summaryLine([reps])).toBe(
      'Set done. Two clean out of three. Next set, focus on slowing down on the way down.',
    )
  })

  it('praises a great clean set', () => {
    expect(summaryLine([[rep(), rep()]])).toBe(
      'Set done. Two clean out of two. That was a great set.',
    )
  })
})
