/**
 * Draws each person's skeleton over the camera, every body part coloured by its own
 * rule (port of draw_side_skeleton / draw_front_skeleton in the original step3).
 */
import { joint, SIDES, type JointName, type Pose, type Side } from '../pose/landmarks'
import { facingRight } from '../pose/measures'
import type { FrameAnalysis } from '../pose/person'
import { PARALLEL_ANGLE } from '../pose/rules'
import { PALETTE, personColour } from './palette'

type Ctx = CanvasRenderingContext2D
type P = readonly number[]

const MIN_VISIBILITY = 0.3

function bone(ctx: Ctx, a: P, b: P, colour: string, t: number) {
  if (a[2] < MIN_VISIBILITY || b[2] < MIN_VISIBILITY) return
  ctx.beginPath()
  ctx.moveTo(a[0], a[1])
  ctx.lineTo(b[0], b[1])
  ctx.strokeStyle = PALETTE.inkDeep
  ctx.lineWidth = t + 4
  ctx.stroke()
  ctx.strokeStyle = colour
  ctx.lineWidth = t + 1
  ctx.stroke()
}

function dot(ctx: Ctx, p: P, colour: string, t: number) {
  if (p[2] < MIN_VISIBILITY) return
  ctx.beginPath()
  ctx.arc(p[0], p[1], t + 3, 0, Math.PI * 2)
  ctx.fillStyle = PALETTE.text
  ctx.fill()
  ctx.beginPath()
  ctx.arc(p[0], p[1], t + 1.5, 0, Math.PI * 2)
  ctx.fillStyle = colour
  ctx.fill()
}

/** Filled, rounded tag with dark text, centred on (x, y). */
export function label(ctx: Ctx, text: string, x: number, y: number, colour: string, size: number) {
  ctx.font = `700 ${size}px Poppins, system-ui, sans-serif`
  const w = ctx.measureText(text).width
  const pad = size * 0.5
  ctx.beginPath()
  ctx.roundRect(
    x - w / 2 - pad,
    y - size / 2 - pad * 0.7,
    w + pad * 2,
    size + pad * 1.4,
    size * 0.45,
  )
  ctx.fillStyle = colour
  ctx.fill()
  ctx.fillStyle = PALETTE.inkDeep
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y + size * 0.05)
}

function drawSide(ctx: Ctx, f: FrameAnalysis, side: Side, colour: string, t: number) {
  const j = (n: JointName) => joint(f.pose, side, n)
  const legs = f.knee <= PARALLEL_ANGLE ? PALETTE.good : PALETTE.neutral
  const torso = f.leanBad ? PALETTE.bad : PALETTE.good
  const feet = f.heelUp ? PALETTE.bad : PALETTE.good

  bone(ctx, j('shoulder'), j('elbow'), colour, t)
  bone(ctx, j('elbow'), j('wrist'), colour, t)
  bone(ctx, j('shoulder'), j('hip'), torso, t)
  bone(ctx, j('hip'), j('knee'), legs, t)
  bone(ctx, j('knee'), j('ankle'), legs, t)
  for (const [a, b] of [
    ['ankle', 'heel'],
    ['heel', 'foot'],
    ['ankle', 'foot'],
  ] as const)
    bone(ctx, j(a), j(b), feet, t)
  for (const n of Object.keys(SIDES[side]) as JointName[]) dot(ctx, j(n), colour, t)
}

function drawFront(ctx: Ctx, f: FrameAnalysis, colour: string, t: number, size: number) {
  const deep = f.knee <= PARALLEL_ANGLE
  const legs = f.kneesIn ? PALETTE.bad : deep ? PALETTE.good : PALETTE.neutral
  const L = (n: JointName) => joint(f.pose, 'left', n)
  const R = (n: JointName) => joint(f.pose, 'right', n)

  bone(ctx, L('shoulder'), R('shoulder'), colour, t)
  bone(ctx, L('hip'), R('hip'), colour, t)
  for (const j of [L, R]) {
    bone(ctx, j('shoulder'), j('elbow'), colour, t)
    bone(ctx, j('elbow'), j('wrist'), colour, t)
    bone(ctx, j('shoulder'), j('hip'), colour, t)
    bone(ctx, j('hip'), j('knee'), legs, t)
    bone(ctx, j('knee'), j('ankle'), legs, t)
    bone(ctx, j('ankle'), j('foot'), colour, t)
    for (const n of ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'foot'] as const)
      dot(ctx, j(n), colour, t)
  }
  if (f.kneesIn) {
    const kx = (L('knee')[0] + R('knee')[0]) / 2
    const ky = (L('knee')[1] + R('knee')[1]) / 2
    label(ctx, 'KNEES IN', kx, ky - size * 2.5, PALETTE.bad, size)
  }
}

/** Clears the overlay and draws every visible person. */
export function drawFrame(ctx: Ctx, people: (FrameAnalysis | null)[], showNames: boolean) {
  const { width: w, height: h } = ctx.canvas
  ctx.clearRect(0, 0, w, h)
  ctx.lineCap = 'round'
  const t = Math.max(2, Math.min(w, h) / 220)
  const size = Math.max(14, Math.min(w, h) / 28)

  people.forEach((f, i) => {
    if (!f) return
    const colour = personColour(i)
    if (f.view === 'side' && f.side) {
      drawSide(ctx, f, f.side, colour, t)
      const k = joint(f.pose, f.side, 'knee')
      const dx = (facingRight(f.pose, f.side) ? 1 : -1) * size * 3.5
      label(ctx, `${Math.round(f.knee)}°`, k[0] + dx, k[1], colour, size)
    } else {
      drawFront(ctx, f, colour, t, size)
    }
    if (showNames) {
      const head: Pose[number] = f.pose[0]
      label(ctx, `Person ${i + 1}`, head[0], head[1] - size * 3, colour, size)
    }
  })
}
