/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { expect } from '../utils/expect.ts'
import { identity, toCss, Transformation } from '../utils/transformation.ts'

/**
 * Scales and rotates about the origin THEN translates, so zooming in/out with
 * the same coordinates will zoom about the origin.
 */
export type ViewOptions = {
  zoom: number
  /** Radians */
  rotate: number
  x: number
  y: number
}

/**
 * Handles fetching and rendering map tiles. Does not handle animation or
 * interaction.
 */
export class MapView {
  static MIN_ZOOM = 11
  static MAX_ZOOM = 20

  #canvas: HTMLCanvasElement
  #context: CanvasRenderingContext2D

  view: Transformation

  constructor (wrapper: HTMLElement) {
    this.#canvas = document.createElement('canvas')
    wrapper.append(this.#canvas)
    this.#context = this.#canvas.getContext('2d') ?? expect('Canvas context')

    this.view = identity
  }

  render () {
    this.#context.save()

    this.#context.transform(...toCss(this.view))
    this.#context.fillRect(0, 0, 256, 256)

    this.#context.restore()
  }
}
