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

### M2: Live camera ✅

- [x] `src/lib/pose/landmarker.ts`: `PoseLandmarker` with the WASM runtime bundled from `node_modules`
      (always matches the JS API, no CDN), `pose_landmarker_lite` model, GPU with CPU fallback.
      Loaded lazily (dynamic import) so only the Train page pays for it
- [x] `CameraStage.svelte`: `getUserMedia`, permission/missing/busy/insecure-context errors, mirrored preview,
      overlay canvas, loading states, fps readout, "step back into frame" hint
- [x] Skeleton coloured per rule (`src/lib/camera/draw.ts`): torso red past 50° lean, feet red on heel lift,
      legs green at depth / red on knee cave, knee-angle tag, "KNEES IN" tag, per-person names when 2+ people
- [x] Detection loop on `requestVideoFrameCallback` (rAF fallback); poses are mirrored to match the preview
- [x] `SquatSet` (`src/lib/pose/set.ts`): `isRealPerson` filter, left-to-right order, rep + fault events
- [x] HUD card (good reps / attempts, last score, average, stage, view, combo, depth bar with parallel marker)
- [x] Rep toasts (score + cue, or NO REP + reason), rep chips (score + GOOD / fault tag), 3-2-1 countdown
- [x] Start / cancel / finish set; finished sets are saved (XP, history, badges) with a summary card
- [ ] Pause / resume (deferred: finishing and starting a new set covers it for now)

### M3: Voice + dashboard

- [ ] `speaker.ts`: `speechSynthesis` queue. Corrections cancel lower-priority lines, lines more than
      1.2 s late are dropped, the summary is always said
- [ ] Voice picker + mute in settings
- [ ] `KneeChart` (canvas, live, standing/parallel guides, good/bad rep markers)
- [ ] `DepthGauge` (needle follows the knee), live `ScoreRing`
- [x] `RepChips` (score + GOOD / fault tag), done in M2
- [x] `SetSummary` card (clean reps, average, focus tip, XP breakdown, level-up, new badges), done in M2
- [ ] Spoken set summary

### M4: Gamification

- [x] Award XP per rep (with combo multiplier) and set bonuses; save `SetRecord` to history (`game/progress.ts`)
- [ ] Combo meter, PERFECT pop + orange flash on 85+, confetti on perfect sets and level-ups
- [ ] Level-up modal, badge unlock toasts
- [ ] History page: score trend chart (SVG), per-set rep breakdown
- [ ] Streak flame on Home and in the nav (already wired to the store)

### M5: Polish and ship

- [ ] Onboarding / recording tips (camera at hip height, 2–3 m, side view for depth, front for knees)
- [ ] Settings: model lite/full, people 1–2 (`session.maxPeople` already supports it), threshold tuning, reset progress, export/import data
- [ ] Accessibility pass (reduced motion, captions for voice lines), mobile layout tuning
- [x] GitHub Pages deploy workflow (`.github/workflows/deploy.yml`; enable Pages with Source: GitHub Actions)

## Ideas for later

Push-ups and lunges · per-person calibration · fatigue detection · a backend for accounts and leaderboards.
