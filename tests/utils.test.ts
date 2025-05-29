import { describe, it, expect } from 'vitest'
import { resolveObjectPath } from '../src/plugins/utils'


describe('resolveObjectPath', () => {
  it('returns nested value when path exists', () => {
    const obj = { a: { b: { c: 1 } } }
    expect(resolveObjectPath(obj, 'a.b.c', null)).toBe(1)
  })

  it('returns default when path does not exist', () => {
    const obj = { a: { b: { c: 1 } } }
    expect(resolveObjectPath(obj, 'a.b.x', 'fallback')).toBeUndefined()
  })
})
