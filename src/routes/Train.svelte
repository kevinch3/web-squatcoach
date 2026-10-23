<script lang="ts">
  import CameraStage from '../components/CameraStage.svelte'
  import HudCard from '../components/HudCard.svelte'
  import RepChips from '../components/RepChips.svelte'
  import SetSummary from '../components/SetSummary.svelte'
  import { session } from '../lib/stores/session.svelte'

  const tips = [
    ['Camera at hip height', '2–3 m away, full body in frame, propped up so it stays still.'],
    ['Side view for depth', 'Back angle and heels are judged from the side.'],
    ['Front view for knees', 'Knee cave is only visible from the front.'],
    ['Good light, fitted clothes', 'Socks or barefoot: loose shoes confuse the heel check.'],
  ]
  const many = $derived(session.maxPeople > 1)
  const huds = $derived(session.people.length ? session.people : [null])

  function again() {
    session.reset()
    session.start()
  }
</script>

<div class="grid gap-6 lg:grid-cols-[1fr_340px]">
  <div class="flex min-w-0 flex-col gap-6">
    <CameraStage />
    {#if session.status !== 'idle'}
      <RepChips reps={session.reps} {many} />
    {/if}
  </div>

  <aside class="flex flex-col gap-4">
    {#if session.status === 'done' && session.outcome}
      <SetSummary outcome={session.outcome} onagain={again} />
    {:else}
      <div class="card p-5">
        {#if session.status === 'active'}
          <button class="btn-primary w-full" onclick={() => session.finish()}>■ Finish set</button>
          <p class="text-muted mt-2 text-center text-xs">Reps are being counted</p>
        {:else if session.status === 'countdown'}
          <button class="btn-ghost w-full" onclick={() => session.finish()}>Cancel</button>
        {:else}
          <button
            class="btn-primary w-full"
            disabled={!session.cameraReady}
            onclick={() => session.start()}>▶ Start set</button
          >
          <p class="text-muted mt-2 text-center text-xs">
            {session.cameraReady
              ? 'Get in position. Counting starts after 3-2-1.'
              : 'Turn on the camera first.'}
          </p>
        {/if}
      </div>

      {#each huds as hud, i (hud?.index ?? i)}
        <HudCard {hud} {many} />
      {/each}

      {#if session.status === 'idle'}
        <div class="card p-5">
          <h2 class="mb-3 font-semibold">Recording tips</h2>
          <ul class="space-y-3 text-sm">
            {#each tips as [title, body] (title)}
              <li>
                <p class="font-medium"><span class="text-brand">▸</span> {title}</p>
                <p class="text-muted">{body}</p>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {/if}
  </aside>
</div>
