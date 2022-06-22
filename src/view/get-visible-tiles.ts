import { extremes } from '../utils/extremes.ts'
import { difference, Point, sum } from '../utils/point.ts'
import { Rectangle } from '../utils/rectangle.ts'
import { inverse, transform, Transformation } from '../utils/transformation.ts'

export type Size = {
  width: number
  height: number
}

function * squareEdges (
  base: Point,
  nextVertex: Point
): Generator<[Point, Point]> {
  yield [base, nextVertex]
  const offset = difference(nextVertex, base)
  const rotated: Point = { x: -offset.y, y: offset.x }
  const farVertex = sum(nextVertex, rotated)
  yield [nextVertex, farVertex]
  const lastVertex = sum(base, rotated)
  yield [farVertex, lastVertex]
  yield [lastVertex, base]
}

/**
 * Constructs a parametric line function from `a` at t = 0 to `b` at t = 1.
 * Intersects it with an orthogonal line x or y = value, then sees if it falls
 * within that range [0, 1]. Then, checks if the intersection in the other axis
 * is between 0 and `under`.
 */
function intersectsEdge (
  a: Point,
  b: Point,
  component: 'x' | 'y',
  value: number,
  under: number
): boolean {
  const time = (value - a[component]) / (b[component] - a[component])
  if (time < 0 || time > 1) {
    return false
  }
  const other = component === 'x' ? 'y' : 'x'
  const intersection = a[other] + time * (b[other] - a[other])
  return 0 <= intersection && intersection <= under
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
): Point[] {
  // Untransform corners of bounding box to determine larger, unrotated bounding
  // box that circumscribes the view box
  const viewBox = Rectangle.topLeft(view.width, view.height)
  const invTransf = inverse(transformation)
  const corners = viewBox.corners().map(pt => transform(invTransf, pt))
  const { min: minX, max: maxX } = extremes(corners.map(({ x }) => x))
  const { min: minY, max: maxY } = extremes(corners.map(({ y }) => y))

  /**
   * A more sophisticated rotated square to rectangle intersection test. Checks
   * if any of its edges intersects the edge of the screen.
   */
  function squareIntersects (base: Point, nextVertex: Point): boolean {
    for (const [a, b] of squareEdges(base, nextVertex)) {
      if (
        intersectsEdge(a, b, 'x', 0, view.height) ||
        intersectsEdge(a, b, 'x', view.width, view.height) ||
        intersectsEdge(a, b, 'y', 0, view.width) ||
        intersectsEdge(a, b, 'y', view.height, view.width)
      ) {
        return true
      }
    }
    return false
  }

  const tiles: Point[] = []

  // For every vertex between tiles, check if it's in the view box
  const startX = Math.floor(minX / tileSize)
  const endX = Math.floor(maxX / tileSize) + 1
  const startY = Math.floor(minY / tileSize)
  const endY = Math.floor(maxY / tileSize) + 1
  for (let i = startX; i < endX; i++) {
    const x = i * tileSize
    for (let j = startY; j < endY; j++) {
      const y = j * tileSize
      const transformed = transform(transformation, { x, y })
      if (
        viewBox.contains(transformed) ||
        squareIntersects(
          transform(transformation, { x, y }),
          transform(transformation, { x: x + tileSize, y })
        )
      ) {
        tiles.push({ x, y })
      }
    }
  }

  return tiles
}
