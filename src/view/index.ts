/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { expect } from '../utils/expect.ts'
import {
  determinant,
  identity,
  toCss,
  Transformation
} from '../utils/transformation.ts'
import { getVisibleTiles, TileOptions } from './get-visible-tiles.ts'
import { ImageCache } from './image-cache.ts'
import { center } from './lat-long.ts'

const tileOptions: TileOptions = {
  origin: center
}

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

  #canvas = document.createElement('canvas')
  #context = this.#canvas.getContext('2d') ?? expect('Canvas context')
  #observer = new ResizeObserver((...args) => this.#onResize(...args))
  #size!: { width: number; height: number }
  #imageCache = new ImageCache(
    'https://assets.concept3d.com/assets/1005/1005_Maps/',
    () => this.render()
  )

  view: Transformation = identity
  options: MapViewOptions

  constructor (
    wrapper: Element,
    { highQuality = true }: Partial<MapViewOptions> = {}
  ) {
    wrapper.append(this.#canvas)
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
    // NOTE: Could consider not clearing to hide the lines between squares
    this.#context.clearRect(0, 0, this.#size.width, this.#size.height)
    this.#context.save()
    this.#context.transform(...toCss(this.view))

    const zoom = Math.max(Math.floor(-Math.log2(determinant(this.view)) / 2), 0)
    const tileSize = 2 ** zoom * 256
    for (const {
      rendered: { x, y },
      tile
    } of getVisibleTiles(tileOptions, this.view, this.#size, tileSize)) {
      const image = this.#imageCache.request(
        `${MapView.MAX_ZOOM - zoom}/${tile.x}/${-1 - tile.y}`
      )
      if (image) {
        this.#context.drawImage(image, x, y, tileSize, tileSize)
      }
    }

    this.#context.restore()
  }

  destroy () {
    this.#observer.disconnect()
    this.#canvas.remove()
  }
}
