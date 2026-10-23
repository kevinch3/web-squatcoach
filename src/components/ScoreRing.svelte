<script lang="ts">
  import { scoreBand } from '../lib/pose/rules'

  let {
    score,
    size = 120,
    label = 'FORM',
  }: { score: number | null; size?: number; label?: string } = $props()

  const r = 42
  const c = 2 * Math.PI * r
  const colour = $derived(
    score === null
      ? 'var(--color-faint)'
      : { good: 'var(--color-good)', ok: 'var(--color-warn)', bad: 'var(--color-bad)' }[
          scoreBand(score)
        ],
  )
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 100 100"
  role="img"
  aria-label="{label} {score ?? 'no score'}"
>
  <circle cx="50" cy="50" {r} fill="none" stroke="var(--color-ink-raised)" stroke-width="9" />
  <circle
    cx="50"
    cy="50"
    {r}
    fill="none"
    stroke={colour}
    stroke-width="9"
    stroke-linecap="round"
    stroke-dasharray={c}
    stroke-dashoffset={c * (1 - (score ?? 0) / 100)}
    transform="rotate(-90 50 50)"
    style="transition: stroke-dashoffset 600ms ease"
  />
  <text x="50" y="52" text-anchor="middle" font-size="26" font-weight="700" fill="var(--color-text)"
    >{score ?? '--'}</text
  >
  <text
    x="50"
    y="68"
    text-anchor="middle"
    font-size="8"
    font-weight="600"
    fill="var(--color-muted)"
    letter-spacing="1.5">{label}</text
  >
</svg>
