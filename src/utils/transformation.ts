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

export function compose (...matrices: Transformation[]): Transformation {
  if (matrices.length > 1) {
    const [{ a, b, c, d, tx, ty }, ...rest] = matrices
    const m = compose(...rest)
    return {
      a: a * m.a + b * m.c,
      b: a * m.b + b * m.d,
      c: c * m.a + d * m.c,
      d: c * m.b + d * m.d,
      tx: a * m.tx + b * m.ty + tx,
      ty: c * m.tx + d * m.ty + ty
    }
  } else if (matrices.length === 1) {
    return matrices[0]
  } else {
    return identity
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

export function determinant ({ a, b, c, d }: Transformation): number {
  return a * d - b * c
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

export type TransformationOptions = {
  scale: number
  rotate: number
  translateX: number
  translateY: number
}

export function makeTransformation ({
  scale = 1,
  rotate = 0,
  translateX = 0,
  translateY = 0
}: Partial<TransformationOptions> = {}): Transformation {
  const cos = rotate === 0 ? 1 : Math.cos(rotate)
  const sin = rotate === 0 ? 0 : Math.sin(rotate)
  return {
    a: scale * cos,
    b: scale * sin,
    c: -scale * sin,
    d: scale * cos,
    tx: translateX,
    ty: translateY
  }
}

export function scale (factor: number): Transformation {
  return makeTransformation({ scale: factor })
}
export function rotate (angle: number): Transformation {
  return makeTransformation({ rotate: angle })
}
export function translate ({ x, y }: Point): Transformation {
  return makeTransformation({ translateX: x, translateY: y })
}
