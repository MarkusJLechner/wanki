import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Review from '../../src/pages/Review.vue'
import { commonGlobal } from '../common'
import { CardType, QueueType } from '../../src/plugins/consts'

// Router mocks
const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ query: {} }),
}))

// Mock components used in Review.vue to keep test light
vi.mock('../../src/components/TheHeader.vue', () => ({
  default: { template: '<div><slot /></div>' },
}))
vi.mock('../../src/components/FlexSpacer.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/ThemeSwitcher.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/ButtonOptions.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/ButtonIcon.vue', () => ({
  default: { template: '<button />' },
}))
vi.mock('../../src/components/ButtonsReview.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/InformationHeaderReview.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/MainContent.vue', () => ({
  default: { template: '<div><slot /></div>' },
}))
vi.mock('../../src/components/ReviewDebug.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/ReviewContainer.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/DebuggingTimeControls.vue', () => ({
  default: { template: '<div />' },
}))

// Timer mock
vi.mock('../../src/plugins/global', () => ({
  createTimer: () => ({ start: vi.fn(), reset: vi.fn() }),
}))

// Minimal in-memory data for db
let deck: any
let card: any
let revlogs: any[]
let getNextCount = 0
let cardsTable: any
let decksTable: any
let revlogTable: any

vi.mock('../../src/plugins/wankidb/db', () => ({
  wankidb: {
    get cards() {
      return cardsTable
    },
    get decks() {
      return decksTable
    },
    get revlog() {
      return revlogTable
    },
    col: { get: vi.fn(async () => ({ crt: Date.now() / 1000, conf: {} })) },
  },
}))

// Mock review helpers
vi.mock('../../src/plugins/reviewer', () => ({
  getNextCard: vi.fn(async () => {
    getNextCount += 1
    return getNextCount === 1 ? card : null
  }),
  getDueCounts: vi.fn(async () => [0, 0, 0]),
}))

// Use real answerCard implementation
import { answerCard } from '../../src/plugins/fsrs'

describe('Review undo', () => {
  beforeEach(() => {
    cardsTable = {
      put: vi.fn(async (obj: any) => {
        Object.entries(obj).forEach(([k, v]) => {
          if (k !== 'timeTaken') {
            card[k] = v
          }
        })
      }),
      get: vi.fn(async () => card),
      where: vi.fn(() => ({
        last: vi.fn(async () => revlogs[revlogs.length - 1]),
      })),
    }
    decksTable = {
      put: vi.fn(async (obj: any) => {
        Object.assign(deck, obj)
      }),
      get: vi.fn(async () => deck),
    }
    revlogTable = {
      add: vi.fn(async (entry: any) => {
        revlogs.push({ id: Date.now(), ...entry })
      }),
      delete: vi.fn(async (id: number) => {
        revlogs = revlogs.filter((r) => r.id !== id)
      }),
      where: vi.fn(() => ({
        last: vi.fn(async () => revlogs[revlogs.length - 1]),
      })),
    }
    deck = {
      id: 1,
      newToday: [0, 0],
      revToday: [0, 0],
      lrnToday: [0, 0],
      getObj() {
        return { ...this }
      },
      save: vi.fn(async () => {
        await decksTable.put(deck)
      }),
    }
    card = {
      id: 1,
      did: 1,
      type: CardType.New,
      queue: QueueType.New,
      due: Date.now(),
      reps: 0,
      lapses: 0,
      data: '',
      timerStarted: 0,
      getObj() {
        const { timeTaken, ...rest } = this
        return { ...rest }
      },
      save: vi.fn(async () => {
        await cardsTable.put(card)
      }),
      get timeTaken() {
        return Promise.resolve(0)
      },
    }
    revlogs = []
    getNextCount = 0
    vi.clearAllMocks()
  })

  it('restores previous card when undoing after rating', async () => {
    const wrapper = mount(Review, { global: { ...commonGlobal } })
    await flushPromises()

    // First card loaded
    expect(wrapper.vm.card?.id).toBe(1)

    await (wrapper.vm as any).onRating(3)
    await flushPromises()

    // After answering, next card is null
    expect(wrapper.vm.card).toBeNull()
    expect(revlogs.length).toBe(1)

    await (wrapper.vm as any).onUndo()
    await flushPromises()

    expect(revlogTable.delete).toHaveBeenCalledWith(expect.any(Number))
    expect(wrapper.vm.card?.id).toBe(1)
    expect(wrapper.vm.card?.type).toBe(CardType.New)
  })
})
