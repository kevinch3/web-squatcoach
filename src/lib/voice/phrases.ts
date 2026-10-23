/**
 * What the coach says. Talks like a trainer instead of reading the screen.
 * Phrase tables match the original step4_voice_coach.py.
 */
import type { Fault } from '../pose/rules'

export const NUMBERS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
]

/** Said mid-rep, the moment the fault appears. */
export const SHOUT: Partial<Record<Fault, string[]>> = {
  lean: ['Chest up!', 'Chest up, chest up!', 'Stay tall!'],
  heels: ['Heels down!', 'Stay on your heels!', 'Heels planted!'],
  knees: ['Knees out!', 'Push those knees out!', 'Knees out, knees out!'],
}

/** The reason for a no rep, when it wasn't already shouted. */
export const FIX: Record<Fault | 'none', string[]> = {
  depth: ['You need to go lower.', 'Hips below your knees.', 'Sit deeper next time.'],
  lean: ['Keep your chest up.', "Don't fold forward."],
  heels: ['Keep your heels down.', 'Weight back in your heels.'],
  knees: ['Push your knees out.', 'Knees over your toes.'],
  tempo: ['Too rushed, slow it down.', 'Control it on the way down.'],
  none: ['Not quite there.'],
}

export const NO_REP = ["That one doesn't count.", 'No rep.', 'Not that one.']

/** A valid rep that still lost some points. */
export const TIP: Record<Fault, string[]> = {
  depth: ['try to sit a little deeper.', 'a bit lower next one.'],
  lean: ['keep that chest proud.', 'stay a little taller.'],
  heels: ['weight in your heels.', 'keep those heels planted.'],
  knees: ['keep your knees over your toes.', 'drive the knees out.'],
  tempo: ['slow it down on the way down.', 'take your time going down.', 'control the descent.'],
}

export const PRAISE = ['Nice.', 'Good.', "That's it.", 'Strong.', 'Beautiful.', 'Yes!']

/** "Next set, focus on ..." */
export const FOCUS: Record<Fault, string> = {
  depth: 'getting a little deeper',
  lean: 'keeping your chest up',
  heels: 'keeping your heels down',
  knees: 'pushing your knees out',
  tempo: 'slowing down on the way down',
}

/** Rotate through phrasings so the coach never repeats itself back to back. */
export const pick = (options: string[], n: number) => options[n % options.length]

export const sayNumber = (n: number) => (n < NUMBERS.length ? NUMBERS[n] : String(n))

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
