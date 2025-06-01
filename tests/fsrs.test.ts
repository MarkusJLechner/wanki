import { describe, it, expect, vi } from 'vitest'
import { answerCard } from '../src/plugins/fsrs'
import { State, Rating } from 'ts-fsrs'
import { QueueType } from '../src/plugins/consts'

vi.mock('../src/plugins/wankidb/db', () => {
  return {
    wankidb: {
      revlog: { add: vi.fn().mockResolvedValue(undefined) },
      decks: {
        get: vi.fn().mockResolvedValue({
          newToday: [0, 0],
          revToday: [0, 0],
          save: vi.fn().mockResolvedValue(undefined),
        }),
      },
      col: {
        get: vi.fn().mockResolvedValue({ crt: Date.now() / 1000, conf: {} }),
      },
    },
  }
})

import { wankidb } from '../src/plugins/wankidb/db'

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
  get timeTaken() {
    return Promise.resolve(0)
  }
}

describe('fsrs answerCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('updates card state and stores data', async () => {
    const card = new MockCard()
    await answerCard(card as any, Rating.Good)
    expect(card.save).toHaveBeenCalled()
    const data = JSON.parse(card.data)
    expect([State.Learning, State.Review]).toContain(data.state)
  })

  it('returns early when card is undefined', async () => {
    await expect(
      answerCard(undefined as any, Rating.Good),
    ).resolves.toBeUndefined()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wankidb.revlog.add).not.toHaveBeenCalled()
  })

  it('sets due to now when answering Again for a learning card', async () => {
    const card = new MockCard()
    card.queue = QueueType.Learn
    card.due = Date.now() + 10000
    await answerCard(card as any, Rating.Again)
    expect(card.due).toBeLessThanOrEqual(Date.now())
  })

  it('writes a revlog entry', async () => {
    const card = new MockCard()
    await answerCard(card as any, Rating.Good)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wankidb.revlog.add).toHaveBeenCalled()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wankidb.revlog.add).toHaveBeenCalledWith(
      expect.objectContaining({ cid: card.id, ease: Rating.Good }),
    )
  })
})
