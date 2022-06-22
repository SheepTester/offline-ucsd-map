import { Point, zero } from './point.ts'

/**
 * Generally speaking, all rectangles in this project are inclusive lower bound,
 * exclusive upper bound.
 */
export class Rectangle {
  min: Point
  max: Point

  constructor (min: Point, max: Point) {
    this.min = min
    this.max = max
  }

  contains ({ x, y }: Point): boolean {
    return (
      this.min.x <= x && x < this.max.x && this.min.y <= y && y < this.max.y
    )
  }

  corners (): Point[] {
    return [
      this.min,
      { x: this.min.x, y: this.max.y },
      { x: this.max.x, y: this.min.y },
      this.max
    ]
  }

  static topLeft (width: number, height: number): Rectangle {
    return new Rectangle(zero, { x: width, y: height })
  }

  static centered (width: number, height: number): Rectangle {
    return new Rectangle(
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 }
    )
  }
}
