# Squat Coach

A gamified AI squat coach that runs **in your browser**. Turn on your webcam and squat: it counts your reps,
scores each one out of 100 on depth, form and tempo, calls out no reps, and coaches you out loud. Good reps
earn XP, combos, streaks and badges.

Pose detection runs locally with MediaPipe. Your video never leaves your device.

> Status: the project is initialized and the coaching engine is ported (see [docs/ROADMAP.md](docs/ROADMAP.md)).
> Live camera coaching is the next milestone.

## How reps are scored

The coach detects whether it sees you from the **side** or the **front**.

| Side view  | Points | Full marks when              |
| ---------- | ------ | ---------------------------- |
| Depth      | 35     | knee angle ≤ 90°             |
| Torso lean | 25     | chest within 45° of vertical |
| Heels      | 15     | heels stay down              |
| Tempo      | 25     | lowering takes ≥ 1 s         |

| Front view | Points | Full marks when             |
| ---------- | ------ | --------------------------- |
| Depth      | 40     | hips drop to knee level     |
| Knees      | 35     | knee gap ≥ 90% of ankle gap |
| Tempo      | 25     | lowering takes ≥ 1 s        |

A rep is a **no rep** if it scores below 70, never reaches depth, leans past 60°, lifts the heels clearly, or
the knees cave below 75% of the ankle gap. All thresholds are in `src/lib/pose/rules.ts`.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # engine unit tests
npm run check     # type check
npm run lint
npm run build     # static site in dist/
```

Stack: Vite, Svelte 5, TypeScript, Tailwind CSS v4, `@mediapipe/tasks-vision`, Vitest.

## Credits

The coaching logic (rep state machine, scoring rules, no-rep rules, view detection and voice script) is ported
from [nimrafaryal/ai-squat-coach](https://github.com/nimrafaryal/ai-squat-coach) (MIT).

This is form feedback for training, not medical advice.

## License

MIT. See [LICENSE](LICENSE).
