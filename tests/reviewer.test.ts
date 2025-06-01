import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDueCounts } from 'plugins/reviewer'
import { QueueType, CardType } from 'plugins/conts'

const mockCards: any[] = []

vi.mock('../src/plugins/wankidb/db', () => {
  return {
    wankidb: {
      cards: {
        where: vi.fn(() => ({
          toArray: () => Promise.resolve(mockCards),
        })),
      },
      decks: {
        get: vi.fn().mockResolvedValue({
          id: 1,
          newToday: [0, 0],
          revToday: [0, 0],
          lrnToday: [0, 0],
          save: vi.fn(),
        }),
      },
    },
  }
})

vi.mock('../src/plugins/collection', () => {
  return {
    deckConfig: vi.fn().mockResolvedValue({
      new: { perDay: 10, ignoreReviewLimit: false },
      rev: { perDay: 10 },
    }),
  }
})

vi.mock('../src/plugins/fsrs', () => {
  return {
    collectionCreatedAt: vi.fn().mockResolvedValue({ today: 0 }),
  }
})

describe('getDueCounts', () => {
  beforeEach(() => {
    mockCards.length = 0
  })

  it('counts due cards by queue', async () => {
    const now = Date.now()
    mockCards.push(
      { id: 1, did: 1, queue: QueueType.New, type: CardType.New },
      {
        id: 2,
        did: 1,
        queue: QueueType.Learn,
        type: CardType.Learn,
        due: now - 1000,
      },
      {
        id: 3,
        did: 1,
        queue: QueueType.DayLearnRelearn,
        type: CardType.Relearning,
        due: 0,
      },
      {
        id: 4,
        did: 1,
        queue: QueueType.Review,
        type: CardType.Review,
        due: now - 1000,
      },
      {
        id: 5,
        did: 1,
        queue: QueueType.Review,
        type: CardType.Review,
        due: now + 10000,
      },
      {
        id: 6,
        did: 1,
        queue: QueueType.DayLearnRelearn,
        type: CardType.Relearning,
        due: 1,
      },
      {
        id: 7,
        did: 1,
        queue: QueueType.Learn,
        type: CardType.Learn,
        due: now + 1000,
      },
    )
    const counts = await getDueCounts(1)
    expect(counts).toEqual([1, 1, 2])
  })

  it('treats relearning cards as learning', async () => {
    const now = Date.now()
    mockCards.push(
      {
        id: 10,
        did: 1,
        queue: QueueType.Learn,
        type: CardType.Relearning,
        due: now - 1000,
      },
      {
        id: 11,
        did: 1,
        queue: QueueType.Review,
        type: CardType.Review,
        due: now - 1000,
      },
    )
    const counts = await getDueCounts(1)
    expect(counts).toEqual([0, 1, 1])
  })
})
