export function resolveObjectPath<T, P extends Record<string, unknown>>(
  object: P,
  path: string,
  defaultValue: T,
): T {
  return path
    .split('.')
    .reduce((current: unknown, property: string): unknown => {
      if (current != null && typeof current === 'object') {
        const obj = current as P
        return obj[property]
      }
      return defaultValue
    }, object) as T
}

export const isObject = <T extends object = Record<string, unknown>>(
  val: unknown,
): val is T => typeof val === 'object' && val !== null && !Array.isArray(val)

export const isArray = <T = unknown>(val: unknown): val is T[] =>
  Array.isArray(val)

export const isString = <T = string>(val: unknown): val is T =>
  typeof val === 'string'

export const isBoolean = <T = boolean>(val: unknown): val is T =>
  typeof val === 'boolean'
