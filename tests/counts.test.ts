import { describe, it, expect } from 'vitest'
import { Counts, CountType } from '../src/plugins/classes/Counts.js'

describe('Counts class', () => {
  it('increments counts individually', () => {
    const c = new Counts(0, 0, 0)
    c.addNew()
    c.addLearn()
    c.addReview()
    expect(c.newCount).toBe(1)
    expect(c.learnCount).toBe(1)
    expect(c.reviewCount).toBe(1)
    expect(c.total()).toBe(3)
  })

  it('changeCount adjusts the correct counter', () => {
    const c = new Counts(0, 0, 0)
    c.changeCount(CountType.New, 2)
    c.changeCount(CountType.Learn, 1)
    c.changeCount(CountType.Review, 3)
    expect(c.newCount).toBe(2)
    expect(c.learnCount).toBe(1)
    expect(c.reviewCount).toBe(3)
  })

  it('equals compares counts', () => {
    const a = new Counts(1, 1, 1)
    const b = new Counts(1, 1, 1)
    const c = new Counts(0, 0, 0)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })
})
