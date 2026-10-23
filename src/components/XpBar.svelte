<script lang="ts">
  import type { LevelInfo } from '../lib/game/xp'

  let { info }: { info: LevelInfo } = $props()
</script>

<div>
  <div class="mb-2 flex items-baseline justify-between text-sm">
    <span class="font-semibold">To level {info.level + 1}</span>
    <span class="text-muted tabular-nums">{info.into} / {info.needed} XP</span>
  </div>
  <div
    class="bg-ink-raised h-3 overflow-hidden rounded-full"
    role="progressbar"
    aria-label="Progress to level {info.level + 1}"
    aria-valuemin={0}
    aria-valuemax={info.needed}
    aria-valuenow={info.into}
  >
    <div
      class="from-brand-deep to-brand h-full rounded-full bg-gradient-to-r transition-[width] duration-700"
      style="width: {Math.max(2, info.progress * 100)}%"
    ></div>
  </div>
</div>
