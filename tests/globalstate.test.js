import { describe, it, expect } from 'vitest'
import { parseType } from '../src/store/globalstate.js'

describe('parseType', () => {
  it('parses numbers', () => {
    expect(parseType('1', 'number')).toBe(1)
  })

  it('parses booleans', () => {
    expect(parseType('true', 'boolean')).toBe(true)
  })

  it('leaves strings unchanged', () => {
    expect(parseType('hello', 'string')).toBe('hello')
  })
})
