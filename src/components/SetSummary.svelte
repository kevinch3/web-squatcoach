<script lang="ts">
  import type { SetOutcome } from '../lib/game/progress'
  import { href } from '../lib/router.svelte'
  import { FOCUS } from '../lib/voice/phrases'
  import ScoreRing from './ScoreRing.svelte'

  let { outcome, onagain }: { outcome: SetOutcome; onagain: () => void } = $props()

  const r = $derived(outcome.record)
  const levelUp = $derived(outcome.levelAfter > outcome.levelBefore)
</script>

<div class="card animate-rise p-6">
  <p class="eyebrow">Set complete</p>
  <div class="mt-3 flex items-center gap-5">
    <ScoreRing score={r.average} size={104} label="AVG" />
    <div>
      <p class="text-4xl font-extrabold tabular-nums">
        {r.good}<span class="text-muted text-xl"> / {r.total}</span>
      </p>
      <p class="text-muted text-sm">clean reps · best combo {r.bestCombo}</p>
    </div>
  </div>

  <p class="mt-5 text-sm">
    {#if r.mainFault}
      Next set, focus on <b class="text-brand">{FOCUS[r.mainFault]}</b>.
    {:else}
      Clean set. Nothing to fix. 💪
    {/if}
  </p>

  <dl class="border-ink-edge mt-5 space-y-1.5 border-t pt-4 text-sm">
    <div class="flex justify-between">
      <dt class="text-muted">Reps</dt>
      <dd class="tabular-nums">+{outcome.xp.reps} XP</dd>
    </div>
    {#if outcome.xp.completed}
      <div class="flex justify-between">
        <dt class="text-muted">Set bonus</dt>
        <dd class="tabular-nums">+{outcome.xp.completed} XP</dd>
      </div>
    {/if}
    {#if outcome.xp.perfect}
      <div class="flex justify-between">
        <dt class="text-muted">Perfect set</dt>
        <dd class="tabular-nums">+{outcome.xp.perfect} XP</dd>
      </div>
    {/if}
    <div class="flex justify-between pt-1 font-bold">
      <dt>Total</dt>
      <dd class="text-brand tabular-nums">+{outcome.xp.total} XP</dd>
    </div>
  </dl>

  {#if levelUp}
    <p class="bg-brand-soft text-brand mt-4 rounded-xl px-4 py-3 text-center font-bold">
      ⬆ Level up! You're level {outcome.levelAfter}
    </p>
  {/if}
  {#if outcome.badges.length}
    <ul class="mt-4 space-y-2">
      {#each outcome.badges as b (b.id)}
        <li class="bg-ink-raised flex items-center gap-3 rounded-xl px-4 py-2.5">
          <span class="text-2xl" aria-hidden="true">{b.icon}</span>
          <span><b>{b.title}</b> <span class="text-muted text-sm">unlocked</span></span>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="mt-6 grid grid-cols-2 gap-3">
    <button class="btn-primary" onclick={onagain}>Go again</button>
    <a class="btn-ghost" href={href('history')}>History</a>
  </div>
</div>
