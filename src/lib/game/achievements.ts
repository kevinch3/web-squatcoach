/** Badges. Each one is checked against lifetime stats after every set. */
import type { RepResult } from '../pose/coach'
import { PERFECT_SET_AVG } from './xp'

export interface SetRecord {
  id: string
  /** ISO timestamp of when the set finished. */
  date: string
  reps: RepResult[]
  good: number
  total: number
  average: number | null
  bestCombo: number
  xp: number
  mainFault: RepResult['mainFault']
}

export interface Stats {
  sets: SetRecord[]
  level: number
  streak: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: (s: Stats) => boolean
}

const allReps = (s: Stats) => s.sets.flatMap((set) => set.reps)
const validReps = (s: Stats) => allReps(s).filter((r) => r.valid)

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-rep',
    title: 'First Rep',
    description: 'Land your first good rep.',
    icon: '🥇',
    unlocked: (s) => validReps(s).length >= 1,
  },
  {
    id: 'clean-set',
    title: 'Clean Set',
    description: 'Finish a set of 5+ reps with no "no reps".',
    icon: '✨',
    unlocked: (s) => s.sets.some((set) => set.total >= 5 && set.good === set.total),
  },
  {
    id: 'perfect-100',
    title: 'Perfect 100',
    description: 'Score 100 on a single rep.',
    icon: '💯',
    unlocked: (s) => validReps(s).some((r) => r.score >= 100),
  },
  {
    id: 'deep-diver',
    title: 'Deep Diver',
    description: 'Hit a knee angle of 75° or deeper.',
    icon: '🌊',
    unlocked: (s) => validReps(s).some((r) => r.view === 'side' && (r.measured.depth ?? 180) <= 75),
  },
  {
    id: 'iron-chest',
    title: 'Iron Chest',
    description: '10 side-view reps with your chest within 30° of vertical.',
    icon: '🛡️',
    unlocked: (s) =>
      validReps(s).filter((r) => r.view === 'side' && (r.measured.lean ?? 90) < 30).length >= 10,
  },
  {
    id: 'flawless',
    title: 'Flawless',
    description: `Finish a set of 5+ reps, all good, averaging ${PERFECT_SET_AVG}+.`,
    icon: '👑',
    unlocked: (s) =>
      s.sets.some(
        (set) => set.total >= 5 && set.good === set.total && (set.average ?? 0) >= PERFECT_SET_AVG,
      ),
  },
  {
    id: 'combo-10',
    title: 'On Fire',
    description: 'Reach a 10-rep combo.',
    icon: '🔥',
    unlocked: (s) => s.sets.some((set) => set.bestCombo >= 10),
  },
  {
    id: 'century',
    title: 'Century',
    description: '100 lifetime good reps.',
    icon: '🏋️',
    unlocked: (s) => validReps(s).length >= 100,
  },
  {
    id: 'streak-3',
    title: 'Warming Up',
    description: '3-day streak.',
    icon: '📅',
    unlocked: (s) => s.streak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: '7-day streak.',
    icon: '⚡',
    unlocked: (s) => s.streak >= 7,
  },
  {
    id: 'streak-30',
    title: 'Unbreakable',
    description: '30-day streak.',
    icon: '🏆',
    unlocked: (s) => s.streak >= 30,
  },
  {
    id: 'level-5',
    title: 'Level 5',
    description: 'Reach level 5.',
    icon: '⭐',
    unlocked: (s) => s.level >= 5,
  },
  {
    id: 'level-10',
    title: 'Level 10',
    description: 'Reach level 10.',
    icon: '🌟',
    unlocked: (s) => s.level >= 10,
  },
]

/** Achievements unlocked by these stats that weren't unlocked before. */
export function newlyUnlocked(stats: Stats, alreadyUnlocked: Iterable<string>): Achievement[] {
  const have = new Set(alreadyUnlocked)
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.unlocked(stats))
}
