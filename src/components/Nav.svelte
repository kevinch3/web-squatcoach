<script lang="ts">
  import { href, router, type Route } from '../lib/router.svelte'
  import { profile } from '../lib/stores/profile.svelte'

  const links: { route: Route; label: string; icon: string }[] = [
    { route: 'home', label: 'Home', icon: '⌂' },
    { route: 'train', label: 'Train', icon: '▶' },
    { route: 'history', label: 'History', icon: '◷' },
    { route: 'achievements', label: 'Badges', icon: '★' },
  ]
</script>

<header class="border-ink-edge/60 bg-ink-deep/80 sticky top-0 z-20 border-b backdrop-blur">
  <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
    <a href={href('home')} class="flex items-center gap-2 font-bold tracking-tight">
      <span class="bg-brand text-ink-deep grid size-8 place-items-center rounded-lg text-sm"
        >SC</span
      >
      <span>Squat<span class="text-brand">Coach</span></span>
    </a>
    <nav class="hidden gap-1 sm:flex">
      {#each links as l (l.route)}
        <a
          href={href(l.route)}
          class="rounded-lg px-3 py-2 text-sm font-medium transition-colors {router.current ===
          l.route
            ? 'bg-brand-soft text-brand'
            : 'text-muted hover:text-text'}"
          aria-current={router.current === l.route ? 'page' : undefined}>{l.label}</a
        >
      {/each}
    </nav>
    <div class="flex items-center gap-3 text-sm">
      <span class="text-muted" title="Daily streak"
        >🔥 <b class="text-text">{profile.streak.current}</b></span
      >
      <span class="bg-ink-raised rounded-full px-3 py-1 font-semibold"
        >Lv <span class="text-brand">{profile.level.level}</span></span
      >
    </div>
  </div>
</header>

<!-- Bottom tab bar on phones -->
<nav
  class="border-ink-edge bg-ink-deep/95 fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t backdrop-blur sm:hidden"
>
  {#each links as l (l.route)}
    <a
      href={href(l.route)}
      class="flex flex-col items-center gap-0.5 py-2.5 text-xs {router.current === l.route
        ? 'text-brand'
        : 'text-muted'}"
      aria-current={router.current === l.route ? 'page' : undefined}
    >
      <span class="text-lg leading-none" aria-hidden="true">{l.icon}</span>{l.label}
    </a>
  {/each}
</nav>
