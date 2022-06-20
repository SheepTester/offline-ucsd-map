import { Point } from './point.ts'

function keyToPoint (key: string): Point {
  const [x, y] = key.split(',').map(Number)
  return { x, y }
}

/**
 * Using a two-number pair as a key for a mapping in JavaScript is really
 * annoying because `Map`s use SameValueZero for its keys. If I tried using a
 * `Point` directly as a `Map` key, it'd use distinct object references rather
 * than their values; equivalence only works for primitives, e.g. strings or
 * numbers. JavaScript doesn't have tuples yet, so there's not really a good way
 * of representing one as a primitive.
 *
 * I have a few options:
 * - Implement a hashmap in JS, so I can add the numbers or something to use as
 *   its hash value, then handle collisions with a linked list or something like
 *   we learned in CSE 12/30.
 * - Serialize points to a number by interweaving its bits or joining them with
 *   an 'a' and converting from base 11.
 * - Serialize points to a string by joining and splitting by a non-numeric
 *   character, like a comma.
 *
 * This implementation will let me switch between them if I feel like. It
 * currently uses the last option.
 */
export class PointMap<V> {
  #data: Map<string, V>

  constructor (entries: [Point, V][] = []) {
    this.#data = new Map(
      entries.map(([{ x, y }, value]) => [`${x},${y}`, value])
    )
  }

  has ({ x, y }: Point): boolean {
    return this.#data.has(`${x},${y}`)
  }

  get ({ x, y }: Point): V | undefined {
    return this.#data.get(`${x},${y}`)
  }

  set ({ x, y }: Point, value: V) {
    this.#data.set(`${x},${y}`, value)
  }

  * iter (): Generator<[Point, V]> {
    for (const [key, value] of this.#data.entries()) {
      yield [keyToPoint(key), value]
    }
  }

  keys (): Point[] {
    return Array.from(this.#data.keys(), keyToPoint)
  }

  entries (): [Point, V][] {
    return Array.from(this.iter())
  }
}
