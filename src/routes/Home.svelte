<script lang="ts">
  import ScoreRing from '../components/ScoreRing.svelte'
  import XpBar from '../components/XpBar.svelte'
  import { FRONT_RULES, SIDE_RULES } from '../lib/pose/rules'
  import { href } from '../lib/router.svelte'
  import { profile } from '../lib/stores/profile.svelte'

  const lastSet = $derived(profile.data.sets.at(-1) ?? null)

  const sideRows = [
    ['Depth', SIDE_RULES.depth[0], 'knee angle ≤ 90°'],
    ['Torso lean', SIDE_RULES.lean[0], 'chest within 45° of vertical'],
    ['Heels', SIDE_RULES.heels[0], 'heels stay down'],
    ['Tempo', SIDE_RULES.tempo[0], 'lowering takes ≥ 1 s'],
  ] as const
  const frontRows = [
    ['Depth', FRONT_RULES.depth[0], 'hips drop to knee level'],
    ['Knees', FRONT_RULES.knees[0], 'knee gap ≥ 90% of ankle gap'],
    ['Tempo', FRONT_RULES.tempo[0], 'lowering takes ≥ 1 s'],
  ] as const
</script>

<section class="grid items-center gap-8 py-6 lg:grid-cols-[1.2fr_1fr] lg:py-12">
  <div>
    <p class="eyebrow mb-3">AI squat coach · runs in your browser</p>
    <h1 class="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
      Every rep <span class="text-brand">counted.</span><br />Every rep
      <span class="text-brand">scored.</span>
    </h1>
    <p class="text-muted mt-4 max-w-xl text-lg">
      Turn on your camera and squat. The coach counts your reps, scores each one out of 100, calls
      out no reps, and coaches you out loud. Good reps earn XP, combos and badges.
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a href={href('train')} class="btn-primary text-lg">▶ Start a set</a>
      <a href={href('achievements')} class="btn-ghost">View badges</a>
    </div>
    <p class="text-muted mt-4 text-sm">
      Video never leaves your device. Pose detection runs locally.
    </p>
  </div>

  <div class="card p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="eyebrow">Your progress</p>
        <p class="mt-1 text-3xl font-bold">Level {profile.level.level}</p>
      </div>
      <div class="text-right">
        <p class="eyebrow">Streak</p>
        <p class="mt-1 text-3xl font-bold">
          <span class={profile.streak.today ? '' : 'opacity-40 grayscale'}>🔥</span>
          {profile.streak.current}
        </p>
      </div>
    </div>
    <div class="mt-6"><XpBar info={profile.level} /></div>
    <div class="mt-6 grid grid-cols-3 gap-3 text-center">
      <div class="bg-ink-raised rounded-xl p-3">
        <p class="text-2xl font-bold tabular-nums">{profile.lifetimeGoodReps}</p>
        <p class="text-muted text-xs">good reps</p>
      </div>
      <div class="bg-ink-raised rounded-xl p-3">
        <p class="text-2xl font-bold tabular-nums">{profile.data.sets.length}</p>
        <p class="text-muted text-xs">sets</p>
      </div>
      <div class="bg-ink-raised rounded-xl p-3">
        <p class="text-2xl font-bold tabular-nums">{profile.achievementCount}</p>
        <p class="text-muted text-xs">badges</p>
      </div>
    </div>
    <div class="border-ink-edge mt-6 flex items-center gap-4 border-t pt-6">
      <ScoreRing score={lastSet?.average ?? null} size={88} label="LAST SET" />
      <p class="text-muted text-sm">
        {#if lastSet}
          {lastSet.good} clean out of {lastSet.total} on your last set.
        {:else}
          No sets yet. Your first set's average form score shows up here.
        {/if}
      </p>
    </div>
  </div>
</section>

<section class="mt-8">
  <h2 class="text-2xl font-bold">How each rep is scored</h2>
  <p class="text-muted mt-2 max-w-3xl">
    The coach detects whether it sees you from the side or the front and applies the right rules. A
    rep is a <b class="text-bad">no rep</b> if it scores below 70, never reaches depth, leans past 60°,
    lifts the heels clearly, or the knees cave below 75% of the ankle gap.
  </p>
  <div class="mt-6 grid gap-4 md:grid-cols-2">
    {#each [{ title: 'Side view', rows: sideRows }, { title: 'Front view', rows: frontRows }] as table (table.title)}
      <div class="card overflow-hidden">
        <h3 class="border-ink-edge border-b px-5 py-3 font-semibold">{table.title}</h3>
        <table class="w-full text-sm">
          <tbody>
            {#each table.rows as [name, pts, when] (name)}
              <tr class="border-ink-edge/60 border-b last:border-0">
                <td class="px-5 py-3 font-medium">{name}</td>
                <td class="text-brand px-2 py-3 font-bold tabular-nums">{pts}</td>
                <td class="text-muted px-5 py-3">{when}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/each}
  </div>
</section>
