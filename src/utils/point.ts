export type Point = {
  x: number
  y: number
}
export const zero: Point = { x: 0, y: 0 }

export function length ({ x, y }: Point): number {
  return Math.hypot(x, y)
}
export function angle ({ x, y }: Point): number {
  return Math.atan2(y, x)
}

export function sum (...points: Point[]): Point {
  if (points.length > 1) {
    const [first, ...rest] = points
    const { x, y } = sum(...rest)
    return { x: first.x + x, y: first.y + y }
  } else if (points.length === 1) {
    return points[0]
  } else {
    return zero
  }
}
export function difference (a: Point, b: Point): Point {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  }
}
export function scale ({ x, y }: Point, factor: number): Point {
  return { x: x * factor, y: y * factor }
}
export function average (...points: Point[]): Point {
  return scale(sum(...points), 0.5)
}

export function fromEvent (event: MouseEvent): Point {
  return {
    x: event.clientX,
    y: event.clientY
  }
}
export function fromBoundingRect ({ top, left }: DOMRect): Point {
  return { x: left, y: top }
}
