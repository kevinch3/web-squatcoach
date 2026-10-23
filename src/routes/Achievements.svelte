<script lang="ts">
  import { ACHIEVEMENTS } from '../lib/game/achievements'
  import { profile } from '../lib/stores/profile.svelte'
</script>

<div class="flex items-baseline justify-between">
  <h1 class="text-3xl font-bold">Badges</h1>
  <p class="text-muted">{profile.achievementCount} unlocked</p>
</div>

<ul class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
  {#each ACHIEVEMENTS as a (a.id)}
    {@const got = profile.unlocked.has(a.id)}
    <li class="card p-5 {got ? 'border-brand/60' : ''}">
      <div
        class="mb-3 grid size-12 place-items-center rounded-xl text-2xl {got
          ? 'bg-brand-soft'
          : 'bg-ink-raised opacity-50 grayscale'}"
        aria-hidden="true"
      >
        {a.icon}
      </div>
      <p class="font-semibold {got ? '' : 'text-muted'}">{a.title}</p>
      <p class="text-muted mt-1 text-sm">{a.description}</p>
      <p
        class="mt-3 text-xs font-semibold tracking-wider uppercase {got
          ? 'text-brand'
          : 'text-faint'}"
      >
        {got ? 'Unlocked' : 'Locked'}
      </p>
    </li>
  {/each}
</ul>
