import { describe, it, expect } from 'vitest'
import { getConstName, ToastType } from '../src/plugins/conts'

describe('getConstName', () => {
  it('returns key name for existing value', () => {
    const obj = { A: 1, B: 2 }
    expect(getConstName(obj, 2)).toBe('B')
  })

  it('returns undefined when value not found', () => {
    expect(getConstName({ A: 1 }, 3)).toBeUndefined()
  })

  it('works with ToastType enum', () => {
    expect(getConstName(ToastType, ToastType.error)).toBe('error')
  })
})
