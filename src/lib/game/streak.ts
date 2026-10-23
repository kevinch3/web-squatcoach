/** Daily streak: consecutive local calendar days with at least one completed set. */

/** Local date key, e.g. "2026-10-23". */
export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

function previousDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d - 1))
}

export interface Streak {
  current: number
  best: number
  /** True when today already has a set (the flame is lit). */
  today: boolean
}

/**
 * The current streak stays alive through today: if the last set was yesterday the
 * streak still counts, it just isn't lit for today yet.
 */
export function computeStreak(setDates: Date[], now = new Date()): Streak {
  const days = new Set(setDates.map(dayKey))
  const today = dayKey(now)

  let best = 0
  for (const day of days) {
    if (days.has(previousDay(day))) continue // not the start of a run
    let len = 1
    let next = day
    for (;;) {
      const [y, m, d] = next.split('-').map(Number)
      next = dayKey(new Date(y, m - 1, d + 1))
      if (!days.has(next)) break
      len++
    }
    best = Math.max(best, len)
  }

  let current = 0
  let cursor = days.has(today) ? today : previousDay(today)
  while (days.has(cursor)) {
    current++
    cursor = previousDay(cursor)
  }
  return { current, best, today: days.has(today) }
}
