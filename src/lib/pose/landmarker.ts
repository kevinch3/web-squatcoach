/**
 * The only module that touches MediaPipe. Loads the pose model and turns a video
 * frame into pixel-space poses for the engine.
 *
 * The WASM runtime is bundled from node_modules (so its version always matches the
 * JS API); the model is fetched from Google's model storage.
 */
import { PoseLandmarker } from '@mediapipe/tasks-vision'
import wasmLoaderPath from '@mediapipe/tasks-vision/vision_wasm_internal.js?url'
import wasmBinaryPath from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url'
import { toPose, type Pose } from './landmarks'

export type ModelVariant = 'lite' | 'full'

const MODEL_URL = (v: ModelVariant) =>
  `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_${v}/float16/latest/pose_landmarker_${v}.task`

export interface LandmarkerOptions {
  model?: ModelVariant
  maxPeople?: number
}

export class PoseDetector {
  private lastTimestamp = -1

  private constructor(private landmarker: PoseLandmarker) {}

  /** Loads the model, preferring the GPU and falling back to the CPU. */
  static async create({ model = 'lite', maxPeople = 1 }: LandmarkerOptions = {}) {
    let lastError: unknown
    for (const delegate of ['GPU', 'CPU'] as const) {
      try {
        const landmarker = await PoseLandmarker.createFromOptions(
          { wasmLoaderPath, wasmBinaryPath },
          {
            baseOptions: { modelAssetPath: MODEL_URL(model), delegate },
            runningMode: 'VIDEO',
            numPoses: maxPeople,
            minPoseDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          },
        )
        return new PoseDetector(landmarker)
      } catch (e) {
        lastError = e
      }
    }
    throw lastError
  }

  /**
   * Poses in the current video frame, in pixels. With `mirror`, x is flipped so the
   * poses line up with a mirrored (selfie) preview.
   */
  detect(video: HTMLVideoElement, timestampMs: number, mirror = false): Pose[] {
    // MediaPipe rejects timestamps that don't strictly increase
    const ts = Math.max(timestampMs, this.lastTimestamp + 1)
    this.lastTimestamp = ts
    const w = video.videoWidth
    const h = video.videoHeight
    const result = this.landmarker.detectForVideo(video, ts)
    return result.landmarks.map((lms) => {
      const pose = toPose(lms, w, h)
      if (mirror) for (const p of pose) p[0] = w - p[0]
      return pose
    })
  }

  close() {
    this.landmarker.close()
  }
}
