/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { expect } from '../utils/expect.ts'
import { map, Point, scale, sum, zero } from '../utils/point.ts'
import {
  determinant,
  identity,
  toCss,
  Transformation
} from '../utils/transformation.ts'
import { getVisibleTiles, TileOptions } from './get-visible-tiles.ts'
import { ImageCache } from './image-cache.ts'
import { center } from './lat-long.ts'

const MAP_TILE_SIZE = 256

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
  #size = { width: 0, height: 0 }
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
    // Shift view by however much the center of the screen changed
    this.view.tx += width / 2 - this.#size.width / 2
    this.view.ty += height / 2 - this.#size.height / 2
    this.#size = { width, height }
    this.render()
  }

  #drawTile (
    imageCache: ImageCache,
    { ...pixel }: Point,
    tileSize: number,
    zoom: number,
    { ...tile }: Point
  ) {
    this.#context.lineWidth = 4
    const image = imageCache.request(`${zoom}/${tile.x}/${tile.y}`)
    if (image) {
      this.#context.drawImage(image, pixel.x, pixel.y, tileSize, tileSize)
      this.#context.strokeStyle = 'red' // TEMP
      this.#context.strokeRect(pixel.x, pixel.y, tileSize, tileSize)
      return
    }

    let zoomOut = zoom
    let crop = zero
    let cropSize = MAP_TILE_SIZE
    while (zoomOut > MapView.MIN_ZOOM) {
      zoomOut--
      cropSize /= 2
      crop = scale(
        sum(crop, {
          x: (tile.x % 2) * MAP_TILE_SIZE,
          y: (1 - (tile.y % 2)) * MAP_TILE_SIZE
        }),
        0.5
      )
      tile = map(tile, comp => Math.floor(comp / 2))

      const image = imageCache.get(`${zoomOut}/${tile.x}/${tile.y}`)
      if (image) {
        this.#context.drawImage(
          image,
          crop.x,
          crop.y,
          cropSize,
          cropSize,
          pixel.x,
          pixel.y,
          tileSize,
          tileSize
        )
        this.#context.strokeStyle = 'green' // TEMP
        this.#context.strokeRect(pixel.x, pixel.y, tileSize, tileSize)
        return
      }
    }
    this.#context.strokeStyle = 'blue' // TEMP
    this.#context.strokeRect(pixel.x, pixel.y, tileSize, tileSize)
  }

  render () {
    // NOTE: Could consider not clearing to hide the lines between squares
    this.#context.clearRect(0, 0, this.#size.width, this.#size.height)
    this.#context.save()
    this.#context.transform(...toCss(this.view))

    const zoom = Math.max(Math.floor(-Math.log2(determinant(this.view)) / 2), 0)
    const tileSize = 2 ** zoom * 256
    for (const { pixel, tile } of getVisibleTiles(
      tileOptions,
      this.view,
      this.#size,
      tileSize
    )) {
      this.#drawTile(
        this.#imageCache,
        pixel,
        tileSize,
        MapView.MAX_ZOOM - zoom,
        tile
      )
    }

    this.#context.restore()
  }

  destroy () {
    this.#observer.disconnect()
    this.#canvas.remove()
  }
}
