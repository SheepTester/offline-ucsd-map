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

export class ImageCache {
  #host: string
  #onImageLoad: () => void
  #images: Map<string, HTMLImageElement> = new Map()
  #imagesLoaded = false
  #loading: Set<string> = new Set()
  #tempStopLoading = false // TEMP

  constructor (host: string, onImageLoad: () => void) {
    this.#host = host
    this.#onImageLoad = onImageLoad

    setTimeout(() => {
      this.#tempStopLoading = true
      console.log('no more loading.')
    }, 1000)
  }

  #load (path: string): void {
    if (!this.#loading.has(path) && !this.#tempStopLoading) {
      if (this.#loading.size === 0) {
        window.requestAnimationFrame(this.#handleFrame)
      }
      this.#loading.add(path)
      loadImage(this.#host + path).then(image => {
        this.#loading.delete(path)
        this.#images.set(path, image)
        this.#imagesLoaded = true
      })
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
      this.#load(path)
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
