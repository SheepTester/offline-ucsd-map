export function expect (expected = 'Non-nullish value'): never {
  throw new TypeError(`${expected} expected.`)
}
