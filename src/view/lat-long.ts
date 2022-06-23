import { Point } from '../utils/point.ts'

/** The highest zoom level on maps.ucsd.edu is 20. */
const SCALE = 2 ** (7 + 20)

export function latLongToPixel (latitude: number, longitude: number): Point {
  return {
    x: SCALE * (longitude / 180 + 1),
    y:
      -SCALE *
      (Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360)) / Math.PI +
        1)
  }
}

/** The origin of the map, University Center. */
export const center = latLongToPixel(32.877341347399, -117.23531663418)
