import { extremes } from '../utils/extremes.ts'
import { mod } from '../utils/modulo.ts'
import { difference, map, Point, sum } from '../utils/point.ts'
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

export type TileOptions = {
  origin: Point
}

export type Tile = {
  position: Point
  /**
   * Note that map tiles have an uninverted y axis, so positive y is upwards.
   */
  tile: Point
}

/**
 * In a grid of tiles of size `tileSize`, returns a set of the coordinates of
 * the top left corners of tiles that are within the visible bounding box of
 * size `view` (with the origin at the top left corner of the screen). Relative
 * to the view box, the tiles are transformed according to `transformation`.
 *
 * Tiles are assumed to be infinitely tiled squares where the origin (0, 0) is
 * at `options.origin`, so the tile containing the origin is at
 */
export function getVisibleTiles (
  options: TileOptions,
  transformation: Transformation,
  view: Size,
  tileSize: number
): Tile[] {
  const offset = map(options.origin, component => -mod(component, tileSize))
  const tileOffset = map(options.origin, component =>
    Math.floor(component / tileSize)
  )

  // Untransform corners of bounding box to determine larger, unrotated bounding
  // box that circumscribes the view box
  const viewBox = Rectangle.topLeft(view.width, view.height)
  const invTransf = inverse(transformation)
  const corners = viewBox.corners().map(pt => transform(invTransf, pt))
  const { min: minX, max: maxX } = extremes(
    corners.map(({ x }) => x - offset.x)
  )
  const { min: minY, max: maxY } = extremes(
    corners.map(({ y }) => y - offset.y)
  )

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

  const tiles: Tile[] = []

  // For every vertex between tiles, check if it's in the view box
  const startX = Math.floor(minX / tileSize)
  const endX = Math.floor(maxX / tileSize) + 1
  const startY = Math.floor(minY / tileSize)
  const endY = Math.floor(maxY / tileSize) + 1
  for (let i = startX; i < endX; i++) {
    const x = i * tileSize + offset.x
    for (let j = startY; j < endY; j++) {
      const y = j * tileSize + offset.y
      const transformed = transform(transformation, { x, y })
      if (
        viewBox.contains(transformed) ||
        squareIntersects(
          transform(transformation, { x, y }),
          transform(transformation, { x: x + tileSize, y })
        )
      ) {
        tiles.push({
          position: { x, y },
          tile: { x: i + tileOffset.x, y: -1 - j - tileOffset.y }
        })
      }
    }
  }

  return tiles
}
