<script lang="ts">
  import ScoreRing from '../components/ScoreRing.svelte'
  import { href } from '../lib/router.svelte'
  import { profile } from '../lib/stores/profile.svelte'
  import { FOCUS } from '../lib/voice/phrases'

  const sets = $derived([...profile.data.sets].reverse())
  const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
</script>

<h1 class="text-3xl font-bold">History</h1>

{#if sets.length === 0}
  <div class="card mt-6 p-10 text-center">
    <p class="text-lg font-semibold">No sets yet</p>
    <p class="text-muted mt-1">Finish a set and it shows up here with every rep's score.</p>
    <a href={href('train')} class="btn-primary mt-6">▶ Start a set</a>
  </div>
{:else}
  <ul class="mt-6 space-y-3">
    {#each sets as set (set.id)}
      <li class="card flex items-center gap-5 p-4">
        <ScoreRing score={set.average} size={72} label="AVG" />
        <div class="min-w-0 flex-1">
          <p class="font-semibold">{set.good} clean / {set.total} reps</p>
          <p class="text-muted text-sm">{fmt.format(new Date(set.date))}</p>
          {#if set.mainFault}
            <p class="text-muted text-sm">Focus on {FOCUS[set.mainFault]}</p>
          {/if}
        </div>
        <p class="text-brand font-bold">+{set.xp} XP</p>
      </li>
    {/each}
  </ul>
{/if}
