/**
 * MediaPipe Pose landmark layout and the shared point types.
 * A pose is 33 points in PIXEL coordinates (x right, y down) plus visibility,
 * so angles aren't distorted by the frame's aspect ratio.
 */

/** [x px, y px, visibility 0..1] */
export type Pt = [number, number, number]
export type Pose = Pt[]

export type Side = 'left' | 'right'
export type JointName = 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'heel' | 'foot'
export type View = 'side' | 'front'

/** MediaPipe landmark indices for each side of the body. */
export const SIDES: Record<Side, Record<JointName, number>> = {
  left: { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27, heel: 29, foot: 31 },
  right: { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28, heel: 30, foot: 32 },
}

export const SIDE_NAMES: Side[] = ['left', 'right']
export const JOINT_NAMES = Object.keys(SIDES.left) as JointName[]

/** Bones drawn for the near side only. */
export const SIDE_BONES: [JointName, JointName][] = [
  ['shoulder', 'elbow'],
  ['elbow', 'wrist'],
  ['shoulder', 'hip'],
  ['hip', 'knee'],
  ['knee', 'ankle'],
  ['ankle', 'heel'],
  ['heel', 'foot'],
  ['ankle', 'foot'],
]

export const NOSE = 0
export const LANDMARK_COUNT = 33

/** Normalised MediaPipe landmarks -> pixel-space pose. */
export function toPose(
  landmarks: { x: number; y: number; visibility?: number }[],
  width: number,
  height: number,
): Pose {
  return landmarks.map((lm) => [lm.x * width, lm.y * height, lm.visibility ?? 0])
}

export function joint(pose: Pose, side: Side, name: JointName): Pt {
  return pose[SIDES[side][name]]
}
