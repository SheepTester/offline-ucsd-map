/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { expect } from '../utils/expect.ts'
import { identity, toCss, Transformation } from '../utils/transformation.ts'
import { getVisibleTiles } from './get-visible-tiles.ts'

export type MapViewOptions = {
  /**
   * Whether to use a higher quality canvas on retina displays. Default: true
   */
  highQuality: boolean
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
  #observer: ResizeObserver
  #size!: { width: number; height: number }

  view: Transformation = identity
  options: MapViewOptions

  constructor (
    wrapper: Element,
    { highQuality = true }: Partial<MapViewOptions> = {}
  ) {
    this.#canvas = document.createElement('canvas')
    wrapper.append(this.#canvas)
    this.#context = this.#canvas.getContext('2d') ?? expect('Canvas context')
    this.#observer = new ResizeObserver(this.#onResize)
    this.#observer.observe(wrapper)

    this.options = { highQuality }
  }

  #onResize: ResizeObserverCallback = ([
    {
      borderBoxSize: [{ blockSize: height, inlineSize: width }]
    }
  ]) => {
    if (this.options.highQuality) {
      this.#canvas.width = width * window.devicePixelRatio
      this.#canvas.height = height * window.devicePixelRatio
      this.#context.scale(window.devicePixelRatio, window.devicePixelRatio)
    } else {
      this.#canvas.width = width
      this.#canvas.height = height
    }
    this.#size = { width, height }
    this.render()
  }

  render () {
    this.#context.clearRect(0, 0, this.#size.width, this.#size.height)
    this.#context.save()
    this.#context.transform(...toCss(this.view))

    this.#context.strokeStyle = 'green'
    this.#context.fillStyle = 'rgba(0, 255, 255, 0.1)'
    this.#context.lineWidth = 4

    for (const { x, y } of getVisibleTiles(this.view, this.#size, 256)) {
      this.#context.fillRect(x, y, 256, 256)
      this.#context.strokeRect(x, y, 256, 256)
    }

    this.#context.restore()
  }

  destroy () {
    this.#observer.disconnect()
    this.#canvas.remove()
  }
}
