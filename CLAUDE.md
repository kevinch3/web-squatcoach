# Squat Coach Web

Gamified AI squat coach that runs entirely in the browser (no backend). A port of
[nimrafaryal/ai-squat-coach](https://github.com/nimrafaryal/ai-squat-coach) to live webcam coaching.
Milestones live in `docs/ROADMAP.md`. Keep them updated as work lands.

## Commands

- `npm run dev`: dev server
- `npm run build` / `npm run preview`: static build into `dist/` (relative base, works on any subpath)
- `npm test`: Vitest (engine + game rules)
- `npm run check`: svelte-check + tsc
- `npm run lint` / `npm run format`

Run `npm test && npm run check && npm run lint` before committing.

## Architecture

- `src/lib/pose/`: the coaching engine. **Pure TypeScript, no DOM, no MediaPipe**, so it can be unit-tested
  with synthetic poses (`tests/helpers.ts`). Only `landmarker.ts` (M2) may import `@mediapipe/tasks-vision`.
  - `rules.ts` holds every threshold, using the same names and values as the original `step3_form_score.py`.
  - Poses are 33 `[x px, y px, visibility]` points (pixel space, so angles aren't skewed by aspect ratio).
  - Time is in seconds, not frames.
- `src/lib/voice/`: what the coach says (`phrases.ts`, `script.ts`). Pure. Speech output goes in `speaker.ts` (M3).
- `src/lib/game/`: XP, levels, combo, streak, achievements. Pure.
- `src/lib/stores/*.svelte.ts`: Svelte 5 rune stores. `storage.ts` is the only code touching `localStorage`.
- `src/lib/router.svelte.ts`: hash router (`#/`, `#/train`, `#/history`, `#/achievements`).
- `src/routes/`: pages. `src/components/`: shared UI.

## Style

- Svelte 5 runes (`$state`, `$derived`, `$props`). No legacy stores.
- Tailwind v4. Brand tokens are in `src/app.css` `@theme`: `brand` (#F97415 orange), `ink` (#24272E dark) and
  shades, `good` / `bad` for rep results. Use tokens, not raw hex, in components.
- Shared component classes (`card`, `btn-primary`, `btn-ghost`, `eyebrow`) are `@utility` blocks in `app.css`.
- Prettier: no semicolons, single quotes, width 100.
