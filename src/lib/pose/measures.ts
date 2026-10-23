/** Body measurements the form rules are built on. */
import { joint, SIDES, type Pose, type Side } from './landmarks'
import { clamp, mid, sideVisibility } from './math'
import { MIN_BODY_HEIGHT, MIN_BODY_VISIBILITY } from './rules'

const RAD = 180 / Math.PI

/** Angle between the hip->shoulder line and straight up, in degrees. */
export function torsoLean(pose: Pose, side: Side): number {
  const s = joint(pose, side, 'shoulder')
  const h = joint(pose, side, 'hip')
  const vx = s[0] - h[0]
  const vy = s[1] - h[1]
  const cos = -vy / (Math.hypot(vx, vy) + 1e-6) // image y points down
  return Math.acos(clamp(cos, -1, 1)) * RAD
}

/** How far the heel sits above the toe, relative to shin length. */
export function heelRise(pose: Pose, side: Side): number {
  const heel = joint(pose, side, 'heel')
  const toe = joint(pose, side, 'foot')
  const k = joint(pose, side, 'knee')
  const a = joint(pose, side, 'ankle')
  const shin = Math.hypot(k[0] - a[0], k[1] - a[1])
  return (toe[1] - heel[1]) / (shin + 1e-6)
}

/** Shoulder width / torso length. Wide from the front, narrow from the side. */
export function shoulderRatio(pose: Pose): number {
  const width = Math.abs(joint(pose, 'left', 'shoulder')[0] - joint(pose, 'right', 'shoulder')[0])
  const sh = mid(pose, 'shoulder')
  const hip = mid(pose, 'hip')
  return width / (Math.hypot(sh[0] - hip[0], sh[1] - hip[1]) + 1e-6)
}

/**
 * Knee gap / ankle gap. About 1 or more when knees track over the feet,
 * well below 1 when the knees cave in.
 */
export function kneeRatio(pose: Pose): number {
  const knees = Math.abs(joint(pose, 'left', 'knee')[0] - joint(pose, 'right', 'knee')[0])
  const ankles = Math.abs(joint(pose, 'left', 'ankle')[0] - joint(pose, 'right', 'ankle')[0])
  return knees / (ankles + 1e-6)
}

/** True when the foot points right in the image (used to place the angle label). */
export function facingRight(pose: Pose, side: Side): boolean {
  return joint(pose, side, 'foot')[0] > joint(pose, side, 'heel')[0]
}

/** Filters out false detections in posters, reflections, background clutter... */
export function isRealPerson(pose: Pose, frameHeight: number): boolean {
  // Judge by the better-visible side: from the side, the far half is hidden
  const vis = sideVisibility(pose, ['shoulder', 'hip', 'knee'])
  if (Math.max(vis.left, vis.right) < MIN_BODY_VISIBILITY) return false
  const L = SIDES.left
  const R = SIDES.right
  const height =
    Math.max(pose[L.ankle][1], pose[R.ankle][1]) -
    Math.min(pose[L.shoulder][1], pose[R.shoulder][1])
  return height >= MIN_BODY_HEIGHT * frameHeight
}
