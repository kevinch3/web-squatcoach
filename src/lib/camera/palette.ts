/**
 * Canvas colours. Canvas can't use Tailwind classes, so these mirror the
 * `@theme` tokens in src/app.css. Keep the two in sync.
 */
export const PALETTE = {
  brand: '#f97415',
  inkDeep: '#181a1f',
  text: '#f4f4f5',
  good: '#4ade80',
  bad: '#f43f5e',
  neutral: '#f4f4f5',
} as const

/** One colour per person: brand orange, then sky blue. */
export const PERSON_COLOURS = ['#f97415', '#38bdf8'] as const

export const personColour = (i: number) => PERSON_COLOURS[i % PERSON_COLOURS.length]
