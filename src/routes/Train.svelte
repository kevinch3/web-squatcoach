<script lang="ts">
  import ScoreRing from '../components/ScoreRing.svelte'

  const tips = [
    ['Camera at hip height', '2–3 m away, full body in frame, propped up so it stays still.'],
    ['Side view for depth', 'Back angle and heels are judged from the side.'],
    ['Front view for knees', 'Knee cave is only visible from the front.'],
    ['Good light, fitted clothes', 'Socks or barefoot: loose shoes confuse the heel check.'],
  ]
</script>

<div class="grid gap-6 lg:grid-cols-[1fr_340px]">
  <section
    class="card bg-ink-deep relative grid aspect-video place-items-center overflow-hidden"
    aria-label="Camera"
  >
    <div class="text-center">
      <div
        class="border-brand/40 text-brand mx-auto mb-4 grid size-16 place-items-center rounded-full border-2 text-2xl"
      >
        ●
      </div>
      <p class="font-semibold">Live camera coaching is coming next</p>
      <p class="text-muted mt-1 text-sm">
        Milestone 2 on the roadmap: webcam + pose overlay + HUD.
      </p>
    </div>
  </section>

  <aside class="flex flex-col gap-4">
    <div class="card flex items-center gap-5 p-5">
      <ScoreRing score={null} size={96} label="LAST REP" />
      <div>
        <p class="eyebrow">Good reps</p>
        <p class="text-4xl font-extrabold tabular-nums">
          0<span class="text-muted text-lg"> / 0</span>
        </p>
        <p class="text-muted text-sm">Combo ×1</p>
      </div>
    </div>
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
  </aside>
</div>
