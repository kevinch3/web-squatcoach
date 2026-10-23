/** Short tags for a rep's main fault (rep chips, toasts). */
import type { RepResult } from './coach'
import type { Fault } from './rules'

export const FAULT_TAG: Record<Fault, string> = {
  depth: 'DEPTH',
  lean: 'CHEST',
  heels: 'HEELS',
  knees: 'KNEES',
  tempo: 'RUSHED',
}

export const repTag = (r: RepResult) =>
  r.valid ? 'GOOD' : r.mainFault ? FAULT_TAG[r.mainFault] : 'NO REP'
