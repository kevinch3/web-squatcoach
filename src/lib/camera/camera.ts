/** Webcam access with errors a person can act on. */

export type CameraErrorKind = 'unsupported' | 'denied' | 'missing' | 'busy' | 'unknown'

export class CameraError extends Error {
  constructor(
    readonly kind: CameraErrorKind,
    message: string,
  ) {
    super(message)
  }
}

const MESSAGES: Record<CameraErrorKind, string> = {
  unsupported: 'This browser can’t use the camera here. Open the app over HTTPS (or localhost).',
  denied: 'Camera access was blocked. Allow it in your browser’s site settings, then try again.',
  missing: 'No camera was found. Plug one in or try another device.',
  busy: 'The camera is being used by another app. Close it and try again.',
  unknown: 'The camera couldn’t start. Try again.',
}

function kindOf(e: unknown): CameraErrorKind {
  const name = e instanceof DOMException ? e.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'missing'
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy'
  return 'unknown'
}

/** Starts the front camera and plays it into `video`. */
export async function startCamera(video: HTMLVideoElement): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new CameraError('unsupported', MESSAGES.unsupported)
  }
  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
    })
  } catch (e) {
    const kind = kindOf(e)
    throw new CameraError(kind, MESSAGES[kind])
  }
  video.srcObject = stream
  video.muted = true
  video.playsInline = true
  await video.play()
  return stream
}

export function stopCamera(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop())
}
