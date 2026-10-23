<script lang="ts">
  import { repTag } from '../lib/pose/faults'
  import { scoreBand } from '../lib/pose/rules'
  import type { TimedRep } from '../lib/stores/session.svelte'

  let { reps, many = false }: { reps: TimedRep[]; many?: boolean } = $props()

  const slots = $derived(Array.from({ length: 10 }, (_, i) => reps.slice(-10)[i] ?? null))
  const avgTempo = $derived(
    reps.length ? reps.reduce((a, r) => a + (r.rep.measured.tempo ?? 0), 0) / reps.length : null,
  )
  const scoreClass = (s: number) =>
    ({ good: 'text-good', ok: 'text-brand', bad: 'text-bad' })[scoreBand(s)]
</script>

<div class="card p-5">
  <div class="flex items-baseline justify-between">
    <h2 class="font-semibold">Rep breakdown</h2>
    {#if avgTempo !== null}
      <p class="text-muted text-sm">avg lowering {avgTempo.toFixed(1)}s</p>
    {/if}
  </div>
  <ol class="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
    {#each slots as r, i (i)}
      {#if r}
        <li
          class="animate-rise flex flex-col items-center rounded-xl border-2 px-1 py-2 {r.rep.valid
            ? 'border-good/70 bg-good/10'
            : 'border-bad/70 bg-bad/10'}"
        >
          <span class="text-muted text-[10px] font-semibold tracking-wider uppercase">
            {many ? `P${r.person + 1}·#${r.rep.rep}` : `Rep ${r.rep.rep}`}
          </span>
          <span
            class="text-2xl font-bold tabular-nums {r.rep.valid
              ? scoreClass(r.rep.score)
              : 'text-text'}">{r.rep.score}</span
          >
          <span class="text-[11px] font-bold {r.rep.valid ? 'text-good' : 'text-bad'}"
            >{repTag(r.rep)}</span
          >
        </li>
      {:else}
        <li class="border-ink-edge h-[76px] rounded-xl border-2 border-dashed"></li>
      {/if}
    {/each}
  </ol>
</div>
