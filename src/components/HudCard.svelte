<script lang="ts">
  import { personColour } from '../lib/camera/palette'
  import { comboMultiplier } from '../lib/game/combo'
  import { PARALLEL_ANGLE, scoreBand } from '../lib/pose/rules'
  import type { PersonHud } from '../lib/stores/session.svelte'

  let { hud, many = false }: { hud: PersonHud | null; many?: boolean } = $props()

  // Depth bar: standing (180°) empty, 70° full, target line at parallel
  const DEPTH_FULL = 70
  const fillOf = (knee: number) => Math.min(1, Math.max(0, (180 - knee) / (180 - DEPTH_FULL)))
  const target = fillOf(PARALLEL_ANGLE)
  const scoreClass = (s: number | null) =>
    s === null
      ? 'text-muted'
      : { good: 'text-good', ok: 'text-brand', bad: 'text-bad' }[scoreBand(s)]
</script>

<div class="card relative overflow-hidden p-5">
  <span
    class="absolute inset-y-0 left-0 w-1.5"
    style="background: {personColour(hud?.index ?? 0)}"
    aria-hidden="true"
  ></span>
  <div class="flex items-center justify-between text-xs font-semibold tracking-widest uppercase">
    <span style="color: {personColour(hud?.index ?? 0)}"
      >{many ? `Person ${(hud?.index ?? 0) + 1}` : 'You'}</span
    >
    <span class="text-muted">{hud?.view ?? '—'} view</span>
    <span>{hud?.stage ?? 'UP'}</span>
  </div>

  <div class="mt-3 grid grid-cols-2 gap-4">
    <div>
      <p class="text-6xl leading-none font-extrabold tabular-nums">{hud?.good ?? 0}</p>
      <p class="text-muted mt-1 text-sm">good / {hud?.attempts ?? 0}</p>
    </div>
    <div>
      <p class="eyebrow">Last rep</p>
      <p class="text-4xl font-bold tabular-nums {scoreClass(hud?.lastScore ?? null)}">
        {hud?.lastScore ?? '--'}
      </p>
      <p class="text-muted text-sm tabular-nums">AVG {hud?.average ?? '--'}</p>
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between text-sm">
    <span class="text-muted">Combo</span>
    <span class="font-bold tabular-nums {hud && hud.combo >= 3 ? 'text-brand' : ''}">
      {hud?.combo ?? 0}{#if hud && hud.combo >= 3}
        <span class="ml-1">🔥 ×{comboMultiplier(hud.combo)}</span>{/if}
    </span>
  </div>

  <div class="mt-4">
    <div class="relative h-3 rounded-full bg-ink-raised">
      <div
        class="h-full rounded-full transition-[width] duration-100 {hud?.knee != null &&
        hud.knee <= PARALLEL_ANGLE
          ? 'bg-good'
          : 'bg-brand'}"
        style="width: {hud?.knee != null ? fillOf(hud.knee) * 100 : 0}%"
      ></div>
      <span
        class="bg-text absolute -inset-y-1 w-0.5 rounded"
        style="left: {target * 100}%"
        aria-hidden="true"
      ></span>
    </div>
    <div class="text-muted mt-1.5 flex justify-between text-xs">
      <span class="eyebrow">Depth</span>
      <span class="tabular-nums">{hud?.knee != null ? `${Math.round(hud.knee)}°` : '--'}</span>
    </div>
  </div>
</div>
