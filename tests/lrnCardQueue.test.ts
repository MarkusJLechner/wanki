import { describe, it, expect, beforeEach } from 'vitest'
import queue from '../src/plugins/classes/LrnCardQueue.js'

describe('LrnCardQueue', () => {
  beforeEach(() => {
    queue.clear()
  })

  it('adds cards sorted by due date', () => {
    queue.add(5, 1)
    queue.add(1, 2)
    expect(queue.queue.map(c => c.cid)).toEqual([2, 1])
    expect(queue.getFirstDue()).toBe(1)
  })

  it('clear empties the queue', () => {
    queue.add(2, 3)
    expect(queue.isEmpty()).toBe(false)
    queue.clear()
    expect(queue.isEmpty()).toBe(true)
    expect(queue.getFirstDue()).toBe(0)
  })
})
