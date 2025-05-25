import { describe, it, expect } from 'vitest'
import { _leftToday, getDayCutoff } from '../src/plugins/scheduler.js'

describe('scheduler helpers', () => {
  it('getDayCutoff returns milliseconds', () => {
    const cutoff = getDayCutoff()
    expect(typeof cutoff).toBe('number')
    // should be in milliseconds (10^12 range)
    expect(String(cutoff).length).toBeGreaterThan(10)
  })

  it('_leftToday respects provided time values', () => {
    const delays = [1]
    const left = 1
    const now = 0
    const cutoff = 60 * 1000
    expect(_leftToday(delays, left, now, cutoff)).toBe(0)
  })

  it('_leftToday calculates additional days when cutoff is exceeded', () => {
    const delays = [1, 2, 3]
    const left = 3
    const now = 0
    const cutoff = 2 * 60 * 1000 // two minutes from start
    // only the first step fits today
    expect(_leftToday(delays, left, now, cutoff)).toBe(1)
  })

  it('handles multiple steps across a single day', () => {
    const delays = [10, 10, 10, 10]
    const left = 4
    const now = 0
    const cutoff = 25 * 60 * 1000 // 25 minutes
    expect(_leftToday(delays, left, now, cutoff)).toBe(1)
  })
})
