import { describe, it, expect } from 'vitest'
import { _leftToday, getDayCutoff } from '../src/plugins/scheduler.js'

describe('scheduler helpers', () => {
  it('getDayCutoff returns milliseconds', () => {
    const cutoff = getDayCutoff()
    expect(typeof cutoff).toBe('number')
    // should be in milliseconds (10^12 range)
    expect(String(cutoff).length).toBeGreaterThan(10)
  })

  it('_leftToday respects day cutoff and uses ms', () => {
    const delays = [1, 2, 3]
    const left = 3
    const now = 0
    const cutoff = 2 * 60 * 1000 // two minutes from start
    // With correct ms calculation we should only fit two steps (index 0 and 1)
    const result = _leftToday(delays, left, now, cutoff)
    expect(result).toBe(1)
  })
})
