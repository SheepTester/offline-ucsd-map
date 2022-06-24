/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

function loadImage (url: string): Promise<HTMLImageElement> {
  const image = new Image()
  return new Promise((resolve, reject) => {
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(image))
    image.src = url
  })
}

/**
 * Cap the number of images loading at once because loading a lot of images at
 * once causes lag spikes.
 */
const CONCURRENT_LOAD_LIMIT = Infinity

export class ImageCache {
  #host: string
  #onImageLoad: () => void
  #images: Map<string, HTMLImageElement> = new Map()
  #imagesLoaded = false
  #loading: Set<string> = new Set()
  #loadQueue: string[] = []

  constructor (host: string, onImageLoad: () => void) {
    this.#host = host
    this.#onImageLoad = onImageLoad
  }

  async #load (path: string): Promise<void> {
    this.#loading.add(path)
    const image = await loadImage(this.#host + path)
    this.#loading.delete(path)
    this.#images.set(path, image)
    this.#imagesLoaded = true

    const next = this.#loadQueue.shift()
    if (next !== undefined) {
      this.#load(next)
    }
  }

  #tryLoad (path: string): void {
    if (!this.#loading.has(path)) {
      if (this.#loading.size === 0) {
        window.requestAnimationFrame(this.#handleFrame)
      }
      if (this.#loading.size < CONCURRENT_LOAD_LIMIT) {
        this.#load(path)
      } else {
        this.#loadQueue.push(path)
      }
    }
  }

  /**
   * Returns the image if it's cached. Unlike `request`, it will not try loading
   * the image if it's not cached.
   */
  get (path: string): HTMLImageElement | null {
    return this.#images.get(path) ?? null
  }

  /**
   * Returns the image if it's cached, and if not, it'll start loading it and
   * return null.
   */
  request (path: string): HTMLImageElement | null {
    const image = this.get(path)
    if (!image) {
      this.#tryLoad(path)
    }
    return image
  }

  #handleFrame = () => {
    // Rerender if new images have loaded
    if (this.#imagesLoaded) {
      this.#onImageLoad()
      this.#imagesLoaded = false
    }
    // Keep checking if there's still images loading
    if (this.#loading.size > 0) {
      window.requestAnimationFrame(this.#handleFrame)
    }
  }
}
