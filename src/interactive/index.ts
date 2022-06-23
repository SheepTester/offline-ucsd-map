import {
  angle,
  average,
  difference,
  fromBoundingRect,
  fromEvent,
  length,
  Point,
  scale as scaleVec
} from '../utils/point.ts'
import {
  compose,
  makeTransformation,
  rotate,
  scale,
  Transformation,
  translate
} from '../utils/transformation.ts'

type PointerState = {
  /** ID of the pointer */
  id: number
  /** The starting position of the pointer */
  init: Point
  /** The ending position of the pointer */
  last: Point
}

export interface TransformationProvider {
  get(): Transformation
  set(transformation: Transformation): void
}

export type InteractiveOptions = {
  /**
   * Whether to use a very scroll-wheel-reliant interaction method for mouse
   * users (true) or just to use scrolling for zooming (false).
   *
   * If true, then scrolling normally will pan the map. If shift is held,
   * scrolling vertically will instead scroll horizontally. If control or
   * command is held, then it'll zoom. If control/command and shift are held,
   * then it'll rotate the map around the cursor.
   */
  scrollMode: boolean
}

export class Interactive {
  #wrapper: HTMLElement
  #pointer:
    | (PointerState & {
        /** A second pointer */
        other: PointerState | null
        /** The initial transformation before the interaction */
        transformation: Transformation
      })
    | null = null
  #provider: TransformationProvider

  options: InteractiveOptions

  constructor (
    wrapper: HTMLElement,
    provider: TransformationProvider & Partial<InteractiveOptions>
  ) {
    this.#wrapper = wrapper
    this.#provider = provider

    this.#wrapper.addEventListener('pointerdown', this.#handlePointerDown)
    this.#wrapper.addEventListener('pointermove', this.#handlePointerMove)
    this.#wrapper.addEventListener('pointerup', this.#handlePointerEnd)
    this.#wrapper.addEventListener('pointercancel', this.#handlePointerEnd)
    this.#wrapper.addEventListener('wheel', this.#handleWheel)

    const { scrollMode = false } = provider
    this.options = { scrollMode }
  }

  /**
   * Converts a client coordinate relative to the top left corner of the
   * viewport to a coordinate relative to the top left corner of the wrapper.
   */
  #toWrapper (point: Point): Point {
    return difference(
      point,
      fromBoundingRect(this.#wrapper.getBoundingClientRect())
    )
  }

  #handlePointerDown = (event: PointerEvent) => {
    const point = fromEvent(event)
    const newState: PointerState = {
      id: event.pointerId,
      init: point,
      last: point
    }
    if (this.#pointer) {
      if (this.#pointer.other) {
        return
      }
      this.#pointer = {
        ...this.#pointer,
        init: this.#pointer.last,
        transformation: this.#provider.get(),
        other: newState
      }
    } else {
      this.#pointer = {
        ...newState,
        transformation: this.#provider.get(),
        other: null
      }
    }
    this.#wrapper.setPointerCapture(event.pointerId)
  }

  #handlePointerMove = (event: PointerEvent) => {
    const pointer = this.#pointer
    if (
      pointer?.id === event.pointerId ||
      pointer?.other?.id === event.pointerId
    ) {
      if (pointer.other?.id === event.pointerId) {
        pointer.other.last = fromEvent(event)
      } else {
        pointer.last = fromEvent(event)
      }
      if (pointer.other) {
        const initDiff = difference(pointer.init, pointer.other.init)
        const currentDiff = difference(pointer.last, pointer.other.last)
        const angleDiff = angle(currentDiff) - angle(initDiff)
        const scaleDiff = length(currentDiff) / length(initDiff)
        const currentMidpoint = average(pointer.last, pointer.other.last)
        const translation = difference(
          currentMidpoint,
          average(pointer.init, pointer.other.init)
        )
        const centre = this.#toWrapper(currentMidpoint)
        this.#provider.set(
          compose(
            translate(centre),
            makeTransformation({ scale: scaleDiff, rotate: angleDiff }),
            translate(difference(translation, centre)),
            pointer.transformation
          )
        )
      } else {
        this.#provider.set(
          compose(
            translate(difference(pointer.last, pointer.init)),
            pointer.transformation
          )
        )
      }
    }
  }

  #handlePointerEnd = (event: PointerEvent) => {
    if (this.#pointer?.id === event.pointerId) {
      if (this.#pointer.other) {
        // Make other pointer primary pointer
        this.#pointer = {
          ...this.#pointer.other,
          init: this.#pointer.other.last,
          transformation: this.#provider.get(),
          other: null
        }
      } else {
        this.#pointer = null
      }
    } else if (this.#pointer?.other?.id === event.pointerId) {
      this.#pointer.init = this.#pointer.last
      this.#pointer.transformation = this.#provider.get()
      this.#pointer.other = null
    }
  }

  #handleWheel = (event: WheelEvent) => {
    const centre = this.#toWrapper(fromEvent(event))
    if (!this.options.scrollMode || (event.ctrlKey && !event.shiftKey)) {
      this.#provider.set(
        compose(
          translate(centre),
          scale(1.001 ** -event.deltaY),
          translate(scaleVec(centre, -1)),
          this.#provider.get()
        )
      )
    } else if (event.ctrlKey && event.shiftKey) {
      this.#provider.set(
        compose(
          translate(centre),
          rotate(event.deltaY * 0.001),
          translate(scaleVec(centre, -1)),
          this.#provider.get()
        )
      )
    } else {
      this.#provider.set(
        compose(
          translate({
            x: event.shiftKey ? -event.deltaY : -event.deltaX,
            y: event.shiftKey ? 0 : -event.deltaY
          }),
          this.#provider.get()
        )
      )
    }
    event.preventDefault()
  }

  destroy () {
    this.#wrapper.removeEventListener('pointerdown', this.#handlePointerDown)
    this.#wrapper.removeEventListener('pointermove', this.#handlePointerMove)
    this.#wrapper.removeEventListener('pointerup', this.#handlePointerEnd)
    this.#wrapper.removeEventListener('pointercancel', this.#handlePointerEnd)
    this.#wrapper.removeEventListener('wheel', this.#handleWheel)
  }
}
