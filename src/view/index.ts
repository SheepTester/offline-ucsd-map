/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

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

const MAP_TILE_SIZE = 512

const tileOptions: TileOptions = {
  origin: center
}

export type MapViewOptions = {}

type Layer = {
  /** The base URL for the map tile images. */
  host: string
  /** Div containing the images for the layer. */
  wrapper: HTMLDivElement
  /** Maps image URL paths to the image element. */
  images: Map<string, HTMLImageElement>
  /**
   * Images at the start of each zoom level, if it exists. Zoomed in images are
   * above (after) zoomed out images.
   */
  markers: Map<number, HTMLImageElement>
  /**
   * During rendering, to keep track of image paths that should still be kept
   * (for example, if an enclosed tile is still rendering).
   */
  keep: Set<string>
}

const layers = [
  'https://assets.concept3d.com/assets/1005/1005_Map_8/',
  'https://assets.concept3d.com/assets/1005/1005_Labels_5/'
]

/**
 * Handles fetching and rendering map tiles. Does not handle animation or
 * interaction.
 */
export class MapView {
  static MIN_ZOOM = 11
  static MAX_ZOOM = 20

  #wrapper: HTMLDivElement = document.createElement('div')
  #observer = new ResizeObserver((...args) => this.#onResize(...args))
  #size = { width: 0, height: 0 }
  #layers: Layer[] = []

  view: Transformation = identity
  options: MapViewOptions

  constructor (wrapper: Element, {}: Partial<MapViewOptions> = {}) {
    for (const host of layers) {
      const layer: Layer = {
        host,
        wrapper: document.createElement('div'),
        images: new Map(),
        markers: new Map(),
        keep: new Set()
      }
      this.#layers.push(layer)
      this.#wrapper.append(layer.wrapper)
    }

    this.#wrapper.classList.add('transformation-wrapper')
    wrapper.append(this.#wrapper)
    this.#observer.observe(wrapper)

    this.options = {}
  }

  #onResize: ResizeObserverCallback = ([
    {
      borderBoxSize: [{ blockSize: height, inlineSize: width }]
    }
  ]) => {
    // Shift view by however much the center of the screen changed
    this.view.tx += width / 2 - this.#size.width / 2
    this.view.ty += height / 2 - this.#size.height / 2
    this.#size = { width, height }
    this.render()
  }

  // #drawTile (
  //   imageCache: ImageCache,
  //   { ...pixel }: Point,
  //   tileSize: number,
  //   zoom: number,
  //   { ...tile }: Point
  // ) {
  //   this.#context.lineWidth = 4
  //   const image = imageCache.request(`${zoom}/${tile.x}/${tile.y}`)
  //   if (image) {
  //     this.#context.drawImage(image, pixel.x, pixel.y, tileSize, tileSize)
  //     return
  //   }

  //   let tempZoom = zoom
  //   let tempTile = tile
  //   let crop = zero
  //   let cropSize = MAP_TILE_SIZE
  //   while (tempZoom > MapView.MIN_ZOOM) {
  //     tempZoom--
  //     cropSize /= 2
  //     crop = scale(
  //       sum(crop, {
  //         x: (tempTile.x % 2) * MAP_TILE_SIZE,
  //         y: (1 - (tempTile.y % 2)) * MAP_TILE_SIZE
  //       }),
  //       0.5
  //     )
  //     tempTile = map(tempTile, comp => Math.floor(comp / 2))

  //     const image = imageCache.get(`${tempZoom}/${tempTile.x}/${tempTile.y}`)
  //     if (image) {
  //       this.#context.drawImage(
  //         image,
  //         crop.x,
  //         crop.y,
  //         cropSize,
  //         cropSize,
  //         pixel.x,
  //         pixel.y,
  //         tileSize,
  //         tileSize
  //       )
  //       return
  //     }
  //   }

  //   if (zoom < MapView.MAX_ZOOM) {
  //     // Only do fallback one level in
  //     for (let x = 0; x < 2; x++) {
  //       for (let y = 0; y < 2; y++) {
  //         const image = imageCache.get(
  //           `${zoom + 1}/${tile.x * 2 + x}/${tile.y * 2 + 1 - y}`
  //         )
  //         if (image) {
  //           this.#context.drawImage(
  //             image,
  //             pixel.x + (x * tileSize) / 2,
  //             pixel.y + (y * tileSize) / 2,
  //             tileSize / 2,
  //             tileSize / 2
  //           )
  //         }
  //       }
  //     }
  //   }
  // }

  #createImage (
    layer: Layer,
    zoom: number,
    position: Point,
    tileSize: number,
    tile: Point
  ): void {
    const path = `${zoom}/${tile.x}/${tile.y}`
    layer.keep.add(path)
    let image = layer.images.get(path)
    if (image) {
      return
    }

    image = document.createElement('img')
    image.style.left = `${position.x}px`
    image.style.top = `${position.y}px`
    image.width = tileSize
    image.height = tileSize
    image.draggable = false
    image.src = layer.host + path
    layer.images.set(path, image)

    // Insert into zoom level layer; more zoomed in tiles (higher quality, but
    // smaller) should show on top of zoomed out tiles
    let marker = layer.markers.get(zoom)
    if (marker) {
      marker.after(image)
    } else {
      let tempZoom = zoom
      while (!marker && tempZoom < MapView.MAX_ZOOM) {
        tempZoom++
        marker = layer.markers.get(tempZoom)
      }
      if (marker) {
        marker.before(image)
      } else {
        layer.wrapper.append(image)
      }
      layer.markers.set(zoom, image)
    }
  }

  render (): void {
    this.#wrapper.style.transform = toCss(this.view)
    const zoom = Math.max(Math.floor(-Math.log2(determinant(this.view)) / 2), 0)
    const tileSize = 2 ** zoom * 256

    for (const { position, tile } of getVisibleTiles(
      tileOptions,
      this.view,
      this.#size,
      tileSize
    )) {
      for (const layer of this.#layers) {
        this.#createImage(
          layer,
          MapView.MAX_ZOOM - zoom,
          position,
          tileSize,
          tile
        )
      }
    }

    // Remove unused images
    for (const layer of this.#layers) {
      const markers = new Set(layer.markers.values())
      for (const [path, image] of layer.images) {
        if (!layer.keep.has(path)) {
          if (markers.has(image)) {
            // If the image is a zoom level marker, pass the designation onto
            // its next sibling
            const nextImage =
              image.nextElementSibling instanceof HTMLImageElement
                ? image.nextElementSibling
                : null
            const zoom = parseInt(path)
            if (!nextImage || markers.has(nextImage)) {
              // Next image is a marker for the next zoom level, so this is
              // the last image of the level
              layer.markers.delete(zoom)
            } else {
              layer.markers.set(zoom, nextImage)
              markers.add(nextImage)
            }
          }
          image.remove()
          layer.images.delete(path)
        }
      }
      layer.keep = new Set()
    }
  }

  destroy (): void {
    this.#observer.disconnect()
  }
}
