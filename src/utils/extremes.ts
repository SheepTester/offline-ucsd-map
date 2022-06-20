export function extremes (numbers: number[]) {
  let min = Infinity
  let max = -Infinity
  for (const number of numbers) {
    if (number < min) {
      min = number
    }
    if (number > max) {
      max = number
    }
  }
  return { min, max }
}
