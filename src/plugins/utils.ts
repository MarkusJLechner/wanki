import { toRaw, isRef, isReactive, isProxy } from 'vue'

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

export function deepToRaw<T extends Record<string, any>>(sourceObj: T): T {
  const objectIterator = (input: any): any => {
    if (Array.isArray(input)) {
      return input.map((item) => objectIterator(item))
    }
    if (isRef(input) || isReactive(input) || isProxy(input)) {
      return objectIterator(toRaw(input))
    }
    if (input && typeof input === 'object') {
      return Object.keys(input).reduce((acc, key) => {
        acc[key as keyof typeof acc] = objectIterator(input[key])
        return acc
      }, {} as T)
    }
    return input
  }

  return objectIterator(sourceObj)
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>): void => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}
