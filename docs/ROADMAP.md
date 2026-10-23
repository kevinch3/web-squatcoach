# Roadmap

A browser-only, gamified port of [nimrafaryal/ai-squat-coach](https://github.com/nimrafaryal/ai-squat-coach)
(Python + OpenCV, recorded video) to **live webcam coaching** in Svelte + TypeScript.
Brand palette: orange `#F97415` on dark `#24272E` (kevinroberts.ar).

## Mapping from the original

| Original (Python)                                   | Web port                                                  |
| --------------------------------------------------- | --------------------------------------------------------- |
| `pose_utils.py` angles, `Smoother`, `SideChooser`   | `src/lib/pose/math.ts`, `landmarks.ts`                    |
| `step3_form_score.py` measurements, view, `HipDrop` | `src/lib/pose/measures.ts`, `view.ts`                     |
| `step3_form_score.py` `SquatCoach` + constants      | `src/lib/pose/coach.ts`, `rules.ts`                       |
| `step3` per-person loop                             | `src/lib/pose/person.ts` (`PersonTracker`)                |
| `step4_voice_coach.py` phrases + script             | `src/lib/voice/phrases.ts`, `script.ts` (live, streaming) |
| `step4` edge-tts + ffmpeg scheduling                | Web Speech API priority queue (M3)                        |
| `step5_dashboard.py` Pillow dashboard video         | Live Svelte components (M3)                               |
| MediaPipe Python `PoseLandmarker`                   | `@mediapipe/tasks-vision` in the browser (M2)             |
| _(new)_                                             | XP, levels, combos, streaks, badges, history (M4)         |

Time is in **seconds** throughout (not frame numbers), because a webcam has no fixed frame rate.

## Milestones

### M0: Initialize ✅

- [x] Vite + Svelte 5 + TypeScript, Tailwind v4 brand tokens, Poppins
- [x] ESLint, Prettier, svelte-check, Vitest
- [x] Hash router + app shell: Home, Train, History, Badges (desktop nav + phone tab bar)
- [x] `localStorage` persistence layer and profile store (XP, level, streak, badges)

### M1: Engine port ✅

- [x] Angles, smoothing, near-side choice, measurements, view detection, hip drop
- [x] `SquatCoach` state machine, scoring, no-rep rules, live faults
- [x] Per-person pipeline (`PersonTracker`)
- [x] Voice script (live shouts, rep counts, patterns, summary)
- [x] Game rules: XP, level curve, combo, streak, achievements
- [x] Unit tests, including end-to-end runs on synthetic side-view poses

### M2: Live camera

- [ ] `src/lib/pose/landmarker.ts`: load `PoseLandmarker` (WASM from jsDelivr pinned to the installed
      `@mediapipe/tasks-vision` version, `pose_landmarker_lite` model), GPU with CPU fallback
- [ ] `CameraStage.svelte`: `getUserMedia`, permission/error states, mirrored preview, overlay canvas
- [ ] Skeleton coloured per rule (torso red past 50° lean, feet red on heel lift, legs green at depth,
      red on knee cave) and a knee-angle label
- [ ] Detection loop with `requestAnimationFrame` + `detectForVideo`, `isRealPerson` filter,
      left-to-right person order
- [ ] HUD card (good reps / attempts, last score, average, stage, view, depth bar) and rep toast
- [ ] Start / pause / finish set controls; 3-2-1 countdown

### M3: Voice + dashboard

- [ ] `speaker.ts`: `speechSynthesis` queue. Corrections cancel lower-priority lines, lines more than
      1.2 s late are dropped, the summary is always said
- [ ] Voice picker + mute in settings
- [ ] `KneeChart` (canvas, live, standing/parallel guides, good/bad rep markers)
- [ ] `DepthGauge` (needle follows the knee), `RepChips` (score + GOOD / fault tag), live `ScoreRing`
- [ ] `SetSummary` card (clean reps, average, focus tip, spoken summary)

### M4: Gamification

- [ ] Award XP per rep (with combo multiplier) and set bonuses; save `SetRecord` to history
- [ ] Combo meter, PERFECT pop + orange flash on 85+, confetti on perfect sets and level-ups
- [ ] Level-up modal, badge unlock toasts
- [ ] History page: score trend chart (SVG), per-set rep breakdown
- [ ] Streak flame on Home and in the nav (already wired to the store)

### M5: Polish and ship

- [ ] Onboarding / recording tips (camera at hip height, 2–3 m, side view for depth, front for knees)
- [ ] Settings: model lite/full, people 1–2, threshold tuning, reset progress, export/import data
- [ ] Accessibility pass (reduced motion, captions for voice lines), mobile layout tuning
- [ ] GitHub Pages deploy workflow

## Ideas for later

Push-ups and lunges · per-person calibration · fatigue detection · a backend for accounts and leaderboards.
