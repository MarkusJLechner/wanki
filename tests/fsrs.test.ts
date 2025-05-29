import { describe, it, expect, vi } from 'vitest'
import { answerCard } from '../src/plugins/fsrs'
import { State, Rating } from 'ts-fsrs'

vi.mock('../src/plugins/wankidb/db', () => {
  return {
    wankidb: {
      revlog: { add: vi.fn().mockResolvedValue(undefined) },
    },
  }
})

class MockCard {
  id = 1
  did = 1
  type = 0
  queue = 0
  due = Date.now()
  reps = 0
  lapses = 0
  data = ''
  save = vi.fn().mockResolvedValue(undefined)
  get timeTaken() { return Promise.resolve(0) }
}

describe('fsrs answerCard', () => {
  it('updates card state and stores data', async () => {
    const card = new MockCard()
    await answerCard(card as any, Rating.Good)
    expect(card.save).toHaveBeenCalled()
    const data = JSON.parse(card.data)
    expect([State.Learning, State.Review]).toContain(data.state)
  })
})
