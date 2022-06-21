import { Point } from './point.ts'

/**
 * A 2D matrix transformation of the form `[a b tx; c d ty; 0 0 1]`.
 */
export type Transformation = {
  a: number
  b: number
  c: number
  d: number
  tx: number
  ty: number
}

export function inverse ({
  a,
  b,
  c,
  d,
  tx,
  ty
}: Transformation): Transformation {
  const determinant = a * d - b * c
  return {
    a: d / determinant,
    b: -b / determinant,
    c: -c / determinant,
    d: a / determinant,
    tx: (-d * tx + b * ty) / determinant,
    ty: (c * tx - a * ty) / determinant
  }
}

export function transform (
  { a, b, c, d, tx, ty }: Transformation,
  { x, y }: Point
): Point {
  return {
    x: a * x + b * y + tx,
    y: c * x + d * y + ty
  }
}

export const identity: Transformation = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  tx: 0,
  ty: 0
}

/**
 * Unlike `Transformation`, CSS and Canvas2D use elements `a` through `f` for a
 * transformation matrix `[a c e; b d f; 0 0 1]`. The order of the elements is
 * not how I like to think about matrices, so unfortunately `b` and `c` are
 * swapped.
 */
export type CssTransformation = [
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
]

export function toCss ({
  a,
  b,
  c,
  d,
  tx,
  ty
}: Transformation): CssTransformation {
  return [a, c, b, d, tx, ty]
}
