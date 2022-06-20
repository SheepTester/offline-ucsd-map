import { extremes } from '../utils/extremes.ts'
import { PointMap } from '../utils/point-map.ts'
import { Point } from '../utils/point.ts'
import { Rectangle } from '../utils/rectangle.ts'
import { inverse, transform, Transformation } from '../utils/transformation.ts'

export type Size = {
  width: number
  height: number
}

/**
 * In a grid of tiles of size `tileSize`, returns a set of the coordinates of
 * the top left corners of tiles that are within the visible bounding box of
 * size `view` (centered around the origin). Relative to the view box, the tiles
 * are transformed according to `transformation`.
 *
 * `tileSize` should be an integer for best results (for floating point
 * reasons).
 */
export function getVisibleTiles (
  transformation: Transformation,
  view: Size,
  tileSize: number
): PointMap<null> {
  // Untransform corners of bounding box to determine larger, unrotated bounding
  // box that circumscribes the view box
  const viewBox = Rectangle.centered(view.width, view.height)
  const invTransf = inverse(transformation)
  const corners = viewBox.corners().map(pt => transform(invTransf, pt))
  const { min: minX, max: maxX } = extremes(corners.map(({ x }) => x))
  const { min: minY, max: maxY } = extremes(corners.map(({ y }) => y))

  const tiles = new PointMap<null>()

  // For every vertex between tiles, check if it's in the view box
  const startX = Math.ceil(minX / tileSize)
  const endX = Math.ceil(maxX / tileSize) - 1
  const startY = Math.ceil(minY / tileSize)
  const endY = Math.ceil(maxY / tileSize) - 1
  for (let i = startX; i <= endX; i++) {
    const x = i * tileSize
    for (let j = startY; j <= endY; j++) {
      const y = j * tileSize
      const transformed = transform(transformation, { x, y })
      if (viewBox.contains(transformed)) {
        tiles.set({ x, y }, null)
        tiles.set({ x, y: y - tileSize }, null)
        tiles.set({ x: x - tileSize, y }, null)
        tiles.set({ x: x - tileSize, y: y - tileSize }, null)
      }
    }
  }

  return tiles
}
