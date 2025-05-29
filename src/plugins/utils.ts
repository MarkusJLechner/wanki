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
