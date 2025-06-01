import { describe, it, expect } from 'vitest'
import {
  resolveObjectPath,
  isObject,
  isArray,
  isString,
  isBoolean,
} from '../src/plugins/utils'

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

describe('type guards', () => {
  it('correctly identifies objects', () => {
    expect(isObject({ foo: 'bar' })).toBe(true)
    expect(isObject(null)).toBe(false)
  })

  it('correctly identifies arrays', () => {
    expect(isArray([1, 2, 3])).toBe(true)
    expect(isArray('nope')).toBe(false)
  })

  it('correctly identifies strings', () => {
    expect(isString('foo')).toBe(true)
    expect(isString(1)).toBe(false)
  })

  it('correctly identifies booleans', () => {
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean('true')).toBe(false)
  })
})
