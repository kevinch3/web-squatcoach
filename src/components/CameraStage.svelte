<script lang="ts">
  import { onDestroy } from 'svelte'
  import { CameraError, startCamera, stopCamera } from '../lib/camera/camera'
  import { drawFrame } from '../lib/camera/draw'
  import type { PoseDetector } from '../lib/pose/landmarker'
  import { scoreBand } from '../lib/pose/rules'
  import { session } from '../lib/stores/session.svelte'

  type StageState = 'off' | 'starting' | 'loading' | 'ready' | 'error'

  let video: HTMLVideoElement
  let canvas: HTMLCanvasElement
  let stageState = $state<StageState>('off')
  let error = $state('')
  let aspect = $state(16 / 9)
  let fps = $state(0)
  let noOneSince = $state<number | null>(null)
  let now = $state(0)

  let stream: MediaStream | null = null
  let detector: PoseDetector | null = null
  let stopped = false
  let frames = 0
  let fpsFrom = 0

  async function turnOn() {
    stageState = 'starting'
    error = ''
    stopped = false
    // Load MediaPipe and the model while the camera permission prompt is up
    const loading = import('../lib/pose/landmarker').then(({ PoseDetector }) =>
      PoseDetector.create({ maxPeople: session.maxPeople }),
    )
    loading.catch(() => {})
    try {
      stream = await startCamera(video)
      fitCanvas()
      stageState = 'loading'
      detector = await loading
    } catch (e) {
      stopCamera(stream)
      stream = null
      stageState = 'error'
      error =
        e instanceof CameraError
          ? e.message
          : 'The pose model couldn’t load. Check your connection and try again.'
      return
    }
    stageState = 'ready'
    session.cameraReady = true
    fpsFrom = performance.now()
    schedule()
  }

  function fitCanvas() {
    if (!video.videoWidth) return
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      aspect = video.videoWidth / video.videoHeight
    }
  }

  function schedule() {
    if (stopped) return
    if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(tick)
    else requestAnimationFrame(tick)
  }

  function tick() {
    if (stopped || !detector) return
    if (video.readyState >= 2) {
      fitCanvas()
      const t = performance.now()
      const bodies = detector.detect(video, t, true)
      const frame = session.frame(bodies, t / 1000, video.videoHeight)
      drawFrame(canvas.getContext('2d')!, frame.people, session.maxPeople > 1)

      now = t
      if (frame.people.some(Boolean)) noOneSince = null
      else noOneSince ??= t
      frames++
      if (t - fpsFrom >= 1000) {
        fps = Math.round((frames * 1000) / (t - fpsFrom))
        frames = 0
        fpsFrom = t
      }
    }
    schedule()
  }

  onDestroy(() => {
    stopped = true
    stopCamera(stream)
    detector?.close()
    session.cameraReady = false
    session.reset()
  })

  const view = $derived(session.people[0]?.view ?? null)
  const outOfFrame = $derived(noOneSince !== null && now - noOneSince > 1500)
  const toastClass = (valid: boolean, score: number) =>
    !valid
      ? 'bg-bad text-text'
      : { good: 'bg-good text-ink-deep', ok: 'bg-brand text-ink-deep', bad: 'bg-bad text-text' }[
          scoreBand(score)
        ]
</script>

<section
  class="bg-ink-deep border-ink-edge relative mx-auto w-full max-w-full overflow-hidden rounded-2xl border"
  style="aspect-ratio: {aspect}; max-height: 78vh"
  aria-label="Camera"
>
  <video
    bind:this={video}
    class="absolute inset-0 size-full -scale-x-100 object-contain"
    class:invisible={stageState !== 'ready' && stageState !== 'loading'}
    playsinline
    muted
  ></video>
  <canvas bind:this={canvas} class="absolute inset-0 size-full object-contain"></canvas>

  {#if stageState !== 'ready'}
    <div class="absolute inset-0 grid place-items-center p-6 text-center">
      {#if stageState === 'off'}
        <div>
          <div
            class="border-brand/40 text-brand mx-auto mb-4 grid size-16 place-items-center rounded-full border-2 text-2xl"
            aria-hidden="true"
          >
            ●
          </div>
          <p class="text-lg font-semibold">Ready when you are</p>
          <p class="text-muted mt-1 text-sm">Video stays on this device. Nothing is uploaded.</p>
          <button class="btn-primary mt-5" onclick={turnOn}>Turn on camera</button>
        </div>
      {:else if stageState === 'error'}
        <div class="max-w-sm">
          <p class="text-bad font-semibold">Camera problem</p>
          <p class="text-muted mt-1 text-sm">{error}</p>
          <button class="btn-ghost mt-5" onclick={turnOn}>Try again</button>
        </div>
      {:else}
        <div class="bg-ink-deep/70 rounded-xl px-5 py-4 backdrop-blur">
          <div
            class="border-brand mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-t-transparent"
            aria-hidden="true"
          ></div>
          <p class="font-medium" role="status">
            {stageState === 'starting' ? 'Starting camera…' : 'Loading pose model…'}
          </p>
        </div>
      {/if}
    </div>
  {:else}
    <div
      class="pointer-events-none absolute inset-x-3 top-3 flex justify-between text-xs font-semibold"
    >
      <span class="bg-ink-deep/75 rounded-full px-3 py-1 tracking-widest uppercase backdrop-blur">
        {view ? `${view} view` : 'Looking for you…'}
      </span>
      <span class="bg-ink-deep/75 text-muted rounded-full px-3 py-1 tabular-nums backdrop-blur"
        >{fps} fps</span
      >
    </div>

    {#if outOfFrame}
      <p
        class="bg-ink-deep/80 absolute inset-x-6 top-14 mx-auto w-fit rounded-xl px-4 py-2 text-center text-sm backdrop-blur"
        role="status"
      >
        Step back so your whole body is in frame
      </p>
    {/if}

    {#if session.status === 'countdown'}
      <div class="bg-ink-deep/40 absolute inset-0 grid place-items-center">
        {#key session.countdown}
          <span
            class="text-brand animate-ping-once text-9xl font-extrabold tabular-nums drop-shadow-lg"
            >{session.countdown || 'GO'}</span
          >
        {/key}
      </div>
    {/if}

    <div class="absolute inset-x-3 bottom-3 flex flex-col items-center gap-2" aria-live="polite">
      {#each session.toasts as toast (toast.id)}
        <div
          class="animate-rise rounded-xl px-5 py-2.5 text-center font-bold shadow-lg {toastClass(
            toast.rep.valid,
            toast.rep.score,
          )}"
        >
          {#if session.maxPeople > 1}<span class="opacity-70">P{toast.person + 1} · </span>{/if}
          {#if toast.rep.valid}
            <span class="tabular-nums">{toast.rep.score}</span>
            <span class="ml-2 font-semibold">{toast.rep.cue}</span>
          {:else}
            {toast.rep.cue.toUpperCase()}
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</section>
