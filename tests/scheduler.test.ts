import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  _leftToday,
  getDayCutoff,
  answerCard,
  _constrainedIvl,
  _lapseIvl,
  _graduatingIvl,
  _rescheduleAsRev,
  _checkLeech,
  _nextRevIvl,
  _earlyReviewIvl,
  _answerLrnCard,
  _answerRevCard,
  _rescheduleLapse,
  _moveToFirstStep,
  _moveToNextStep,
  _repeatStep,
  _delayForGrade,
  _delayForRepeatingGrade,
  _rescheduleLrnCard,
  _rescheduleNew,
  _rescheduleGraduatingLapse,
  _startingLeft,
  _updateRevIvl,
  _updateEarlyRevIvl,
  _updateRevIvlOnFail,
  _daysLate,
  collectionCreatedAt,
  rolloverHour,
} from '../src/plugins/scheduler.js'
import {
  CardType,
  QueueType,
  Ease,
  Leech,
  NewCardOrder,
  StatisticType,
} from '../src/plugins/conts.js'
import * as collection from '../src/plugins/collection.js'
import * as globalstate from '../src/store/globalstate.js'
import { wankidb } from '../src/plugins/wankidb/db.js'

// Mock dependencies
vi.mock('../src/plugins/wankidb/db.js', () => {
  return {
    wankidb: {
      revlog: {
        add: vi.fn().mockResolvedValue(undefined),
      },
      decks: {
        where: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      },
      dconf: {
        get: vi.fn().mockResolvedValue(null),
      },
    },
  }
})

vi.mock('../src/plugins/collection.js', () => {
  return {
    cardDeckConfig: vi.fn(),
    creationTimestamp: vi.fn(),
    getColKey: vi.fn(),
    getConf: vi.fn(),
    getDecks: vi.fn(),
    setConf: vi.fn(),
  }
})

vi.mock('../src/store/globalstate.js', () => {
  return {
    addToast: vi.fn(),
  }
})

// Mock Card class
class MockCard {
  id = 1
  nid = 1
  did = 1
  ord = 0
  mod = Date.now()
  usn = 0
  type = CardType.New
  queue = QueueType.New
  due = 0
  ivl = 0
  factor = 2500
  reps = 0
  lapses = 0
  left = 0
  odue = 0
  odid = 0
  flags = 0
  data = ''
  timerStarted = 0
  note = { addTag: vi.fn(), save: vi.fn() }

  isInDynamicDeck() {
    return !!this.odid
  }

  increaseRepetition() {
    this.reps++
  }

  isTypeNew() {
    return this.type === CardType.New
  }

  isTypeLearn() {
    return this.type === CardType.Learn
  }

  isTypeReview() {
    return this.type === CardType.Review
  }

  isTypeRelearning() {
    return this.type === CardType.Relearning
  }

  save() {
    return Promise.resolve(this)
  }

  get timeTaken() {
    return Promise.resolve(1000)
  }
}

// Default deck configuration
const defaultDeckConfig = {
  new: {
    delays: [1, 10],
    ints: [1, 4],
    initialFactor: 2500,
    perDay: 20,
    order: NewCardOrder.Due,
    bury: true,
    ignoreReviewLimit: false,
  },
  rev: {
    perDay: 200,
    ease4: 1.3,
    ivlFct: 1,
    maxIvl: 36500,
    hardFactor: 1.2,
  },
  lapse: {
    delays: [10],
    minInt: 1,
    leechFails: 8,
    leechAction: Leech.Suspend,
    mult: 0.7,
  },
  maxTaken: 60,
  resched: true,
}

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

describe('interval calculations', () => {
  it('_constrainedIvl respects minimum and maximum values', () => {
    const conf = { ivlFct: 1, maxIvl: 100 }

    // Basic interval calculation
    expect(_constrainedIvl(10, conf, 0, false)).toBe(10)

    // Respect minimum (prev + 1)
    expect(_constrainedIvl(5, conf, 10, false)).toBe(11)

    // Respect maximum
    expect(_constrainedIvl(150, conf, 0, false)).toBe(100)

    // Apply interval factor
    const confWithFactor = { ivlFct: 1.5, maxIvl: 100 }
    expect(_constrainedIvl(10, confWithFactor, 0, false)).toBe(15)
  })

  it('_lapseIvl calculates lapse interval correctly', () => {
    const card = new MockCard()
    card.ivl = 10

    const conf = { minInt: 1, mult: 0.5 }
    expect(_lapseIvl(card, conf)).toBe(5) // 10 * 0.5 = 5

    // Test minimum interval
    const confWithHigherMin = { minInt: 7, mult: 0.5 }
    expect(_lapseIvl(card, confWithHigherMin)).toBe(7)
  })

  it('_graduatingIvl calculates graduating interval correctly', () => {
    const card = new MockCard()
    const conf = { ints: [1, 4] }

    // New card, not early
    expect(_graduatingIvl(card, conf, false, false)).toBe(1)

    // New card, early
    expect(_graduatingIvl(card, conf, true, false)).toBe(4)

    // Review card
    card.type = CardType.Review
    card.ivl = 5
    expect(_graduatingIvl(card, conf, false, false)).toBe(5)

    // Review card, early (bonus +1)
    expect(_graduatingIvl(card, conf, true, false)).toBe(6)
  })

  it('_nextRevIvl calculates next review interval correctly', () => {
    const card = new MockCard()
    card.type = CardType.Review
    card.ivl = 10
    card.factor = 2500 // 2.5

    const conf = { hardFactor: 1.2, ease4: 1.3, ivlFct: 1, maxIvl: 36500 }

    // Mock _daysLate to return 0
    vi.spyOn(global, '_daysLate').mockReturnValue(0)

    // Hard (ease 2)
    expect(_nextRevIvl(card, Ease.Two, false)).toBe(12) // 10 * 1.2 = 12

    // Good (ease 3)
    expect(_nextRevIvl(card, Ease.Three, false)).toBe(25) // 10 * 2.5 = 25

    // Easy (ease 4)
    expect(_nextRevIvl(card, Ease.Four, false)).toBe(32) // 10 * 2.5 * 1.3 = 32.5 -> 32
  })

  it('_earlyReviewIvl calculates early review interval correctly', () => {
    const card = new MockCard()
    card.type = CardType.Review
    card.ivl = 20
    card.factor = 2500 // 2.5
    card.odue = 15 // 5 days elapsed

    const conf = { hardFactor: 1.2, ease4: 1.3 }

    // Mock mToday to be 10
    vi.spyOn(global, 'mToday', 'get').mockReturnValue(10)

    // Hard (ease 2)
    expect(_earlyReviewIvl(card, Ease.Two, conf)).toBe(6) // 5 * 1.2 = 6

    // Good (ease 3)
    expect(_earlyReviewIvl(card, Ease.Three, conf)).toBe(12) // 5 * 2.5 = 12.5 -> 12

    // Easy (ease 4)
    expect(_earlyReviewIvl(card, Ease.Four, conf)).toBe(14) // 5 * 2.5 * 1.15 = 14.375 -> 14
  })
})

describe('card state transitions', () => {
  let card

  beforeEach(() => {
    card = new MockCard()
    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(defaultDeckConfig)
    vi.spyOn(collection, 'getColKey').mockResolvedValue(0)
    vi.spyOn(global, 'mToday', 'get').mockReturnValue(10)
    vi.spyOn(global, 'mDayCutoff', 'get').mockReturnValue(
      Date.now() + 24 * 60 * 60 * 1000,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('_rescheduleNew transitions a new card to review', async () => {
    card.type = CardType.New
    card.queue = QueueType.New

    _rescheduleNew(card, defaultDeckConfig.new, false)

    expect(card.type).toBe(CardType.Review)
    expect(card.queue).toBe(QueueType.Review)
    expect(card.ivl).toBe(1) // From ints[0]
    expect(card.due).toBe(11) // mToday + ivl
    expect(card.factor).toBe(2500)
  })

  it('_rescheduleGraduatingLapse transitions a lapsed card to review', () => {
    card.type = CardType.Relearning
    card.queue = QueueType.Learn
    card.ivl = 5

    _rescheduleGraduatingLapse(card, false)

    expect(card.type).toBe(CardType.Review)
    expect(card.queue).toBe(QueueType.Review)
    expect(card.due).toBe(15) // mToday + ivl
  })

  it('_moveToFirstStep resets a card to the first learning step', async () => {
    card.type = CardType.Learn
    card.queue = QueueType.Learn
    card.left = 2000 + 3 // 2 days, 3 steps

    // Mock _startingLeft
    vi.spyOn(global, '_startingLeft').mockResolvedValue(1003)

    await _moveToFirstStep(card, defaultDeckConfig.new)

    expect(card.left).toBe(1003)
  })

  it('_moveToNextStep advances a card to the next learning step', () => {
    card.type = CardType.Learn
    card.queue = QueueType.Learn
    card.left = 1003 // 1 day, 3 steps

    _moveToNextStep(card, defaultDeckConfig.new)

    expect(card.left).toBe(1002) // 1 day, 2 steps
  })

  it('_repeatStep repeats the current learning step', async () => {
    card.type = CardType.Learn
    card.queue = QueueType.Learn
    card.left = 1002 // 1 day, 2 steps

    // Mock Date.now
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    await _repeatStep(card, defaultDeckConfig.new)

    // Should set due to current time + delay
    expect(card.due).toBeGreaterThan(now)
  })
})

describe('leech handling', () => {
  let card

  beforeEach(() => {
    card = new MockCard()
    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(defaultDeckConfig)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('_checkLeech identifies and tags leeches', async () => {
    card.lapses = 8 // Equal to leechFails threshold

    const result = await _checkLeech(card, defaultDeckConfig.lapse)

    expect(result).toBe(true)
    expect(card.note.addTag).toHaveBeenCalledWith('leech')
    expect(card.note.save).toHaveBeenCalled()
    expect(card.queue).toBe(QueueType.Suspended)
  })

  it('_checkLeech handles tag-only leech action', async () => {
    card.lapses = 8
    const conf = { ...defaultDeckConfig.lapse, leechAction: Leech.TagOnly }

    const result = await _checkLeech(card, conf)

    expect(result).toBe(true)
    expect(card.note.addTag).toHaveBeenCalledWith('leech')
    expect(card.queue).not.toBe(QueueType.Suspended)
  })

  it('_checkLeech ignores cards below threshold', async () => {
    card.lapses = 7 // Below threshold

    const result = await _checkLeech(card, defaultDeckConfig.lapse)

    expect(result).toBe(false)
    expect(card.note.addTag).not.toHaveBeenCalled()
  })
})

describe('answering cards', () => {
  let card

  beforeEach(() => {
    card = new MockCard()
    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(defaultDeckConfig)
    vi.spyOn(collection, 'getColKey').mockResolvedValue(0)
    vi.spyOn(global, 'mToday', 'get').mockReturnValue(10)
    vi.spyOn(global, 'mDayCutoff', 'get').mockReturnValue(
      Date.now() + 24 * 60 * 60 * 1000,
    )
    vi.spyOn(wankidb.revlog, 'add').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('answerCard handles new cards correctly', async () => {
    card.type = CardType.New
    card.queue = QueueType.New

    // Mock _startingLeft
    vi.spyOn(global, '_startingLeft').mockResolvedValue(1002)

    await answerCard(card, Ease.Three)

    expect(card.type).toBe(CardType.Learn)
    expect(card.queue).toBe(QueueType.Learn)
    expect(card.left).toBe(1002)
    expect(wankidb.revlog.add).toHaveBeenCalled()
  })

  it('answerCard handles learning cards correctly with "again" response', async () => {
    card.type = CardType.Learn
    card.queue = QueueType.Learn
    card.left = 1002

    // Mock _startingLeft and _rescheduleLrnCard
    vi.spyOn(global, '_startingLeft').mockResolvedValue(1002)
    vi.spyOn(global, '_rescheduleLrnCard').mockResolvedValue(60)

    await answerCard(card, Ease.One)

    expect(card.left).toBe(1002)
    expect(wankidb.revlog.add).toHaveBeenCalled()
  })

  it('answerCard handles learning cards correctly with "good" response', async () => {
    card.type = CardType.Learn
    card.queue = QueueType.Learn
    card.left = 1001 // Last step

    // Mock _rescheduleAsRev
    vi.spyOn(global, '_rescheduleAsRev')

    await answerCard(card, Ease.Three)

    expect(global._rescheduleAsRev).toHaveBeenCalled()
    expect(wankidb.revlog.add).toHaveBeenCalled()
  })

  it('answerCard handles review cards correctly with "again" response', async () => {
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 10
    card.factor = 2500

    // Mock _rescheduleLapse
    vi.spyOn(global, '_rescheduleLapse').mockResolvedValue(60)

    await answerCard(card, Ease.One)

    expect(card.lapses).toBe(1)
    expect(card.factor).toBe(2300) // 2500 - 200
    expect(wankidb.revlog.add).toHaveBeenCalled()
  })

  it('answerCard handles review cards correctly with "good" response', async () => {
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 10
    card.factor = 2500

    // Mock _rescheduleRev
    vi.spyOn(global, '_rescheduleRev')

    await answerCard(card, Ease.Three)

    expect(global._rescheduleRev).toHaveBeenCalled()
    expect(wankidb.revlog.add).toHaveBeenCalled()
  })
})

describe('deck options integration', () => {
  let card

  beforeEach(() => {
    card = new MockCard()
    vi.spyOn(global, 'mToday', 'get').mockReturnValue(10)
    vi.spyOn(global, 'mDayCutoff', 'get').mockReturnValue(
      Date.now() + 24 * 60 * 60 * 1000,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('respects new card steps from deck options', async () => {
    card.type = CardType.New
    card.queue = QueueType.New

    const customConfig = {
      ...defaultDeckConfig,
      new: {
        ...defaultDeckConfig.new,
        delays: [1, 5, 10, 20], // Custom learning steps
      },
    }

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(customConfig)

    // Mock _startingLeft to use actual implementation
    vi.spyOn(global, '_startingLeft').mockImplementation(async (card) => {
      const conf = await collection.cardDeckConfig(card)
      const total = conf.new.delays.length
      return total + 0 * 1000 // No extra days
    })

    await answerCard(card, Ease.Three)

    expect(card.type).toBe(CardType.Learn)
    expect(card.queue).toBe(QueueType.Learn)
    expect(card.left).toBe(4) // 4 steps
  })

  it('respects lapse steps from deck options', async () => {
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 10

    const customConfig = {
      ...defaultDeckConfig,
      lapse: {
        ...defaultDeckConfig.lapse,
        delays: [5, 10, 20], // Custom relearning steps
      },
    }

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(customConfig)

    // Mock _startingLeft to use actual implementation
    vi.spyOn(global, '_startingLeft').mockImplementation(async (card) => {
      const conf = await collection.cardDeckConfig(card)
      const total = conf.lapse.delays.length
      return total + 0 * 1000 // No extra days
    })

    await answerCard(card, Ease.One)

    expect(card.type).toBe(CardType.Relearning)
    expect(card.left).toBe(3) // 3 steps
  })

  it('respects interval modifier from deck options', async () => {
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 10
    card.factor = 2500

    const customConfig = {
      ...defaultDeckConfig,
      rev: {
        ...defaultDeckConfig.rev,
        ivlFct: 0.8, // 80% interval modifier
      },
    }

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(customConfig)
    vi.spyOn(global, '_daysLate').mockReturnValue(0)

    // Use actual _nextRevIvl implementation
    const interval = await _nextRevIvl(card, Ease.Three, false)

    // Without modifier: 10 * 2.5 = 25
    // With 0.8 modifier: 25 * 0.8 = 20
    expect(interval).toBe(20)
  })

  it('respects maximum interval from deck options', async () => {
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 100
    card.factor = 2500

    const customConfig = {
      ...defaultDeckConfig,
      rev: {
        ...defaultDeckConfig.rev,
        maxIvl: 150, // Maximum interval of 150 days
      },
    }

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(customConfig)
    vi.spyOn(global, '_daysLate').mockReturnValue(0)

    // Use actual _nextRevIvl implementation
    const interval = await _nextRevIvl(card, Ease.Four, false)

    // Without cap: 100 * 2.5 * 1.3 = 325
    // With cap: 150
    expect(interval).toBe(150)
  })

  it('respects easy bonus from deck options', async () => {
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 10
    card.factor = 2500

    const customConfig = {
      ...defaultDeckConfig,
      rev: {
        ...defaultDeckConfig.rev,
        ease4: 1.5, // 150% easy bonus
      },
    }

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(customConfig)
    vi.spyOn(global, '_daysLate').mockReturnValue(0)

    // Use actual _nextRevIvl implementation
    const interval = await _nextRevIvl(card, Ease.Four, false)

    // With default 1.3 bonus: 10 * 2.5 * 1.3 = 32.5 -> 32
    // With 1.5 bonus: 10 * 2.5 * 1.5 = 37.5 -> 37
    expect(interval).toBe(37)
  })

  it('respects hard factor from deck options', async () => {
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 10
    card.factor = 2500

    const customConfig = {
      ...defaultDeckConfig,
      rev: {
        ...defaultDeckConfig.rev,
        hardFactor: 0.8, // 80% hard factor
      },
    }

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(customConfig)
    vi.spyOn(global, '_daysLate').mockReturnValue(0)

    // Use actual _nextRevIvl implementation
    const interval = await _nextRevIvl(card, Ease.Two, false)

    // With default 1.2 factor: 10 * 1.2 = 12
    // With 0.8 factor: 10 * 0.8 = 8
    expect(interval).toBe(8)
  })
})

describe('day cutoff and timing', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('getDayCutoff calculates correct cutoff time', () => {
    // Default rollover at 4am
    const cutoff = getDayCutoff()

    // Should be next day at 4am
    const expected = new Date('2023-01-02T04:00:00Z').getTime()
    expect(cutoff).toBe(expected)
  })

  it('getDayCutoff handles rollover time in the past', () => {
    // Set time to 5am
    vi.setSystemTime(new Date('2023-01-01T05:00:00Z'))

    // Default rollover at 4am
    const cutoff = getDayCutoff()

    // Should be next day at 4am
    const expected = new Date('2023-01-02T04:00:00Z').getTime()
    expect(cutoff).toBe(expected)
  })

  it('collectionCreatedAt calculates days since creation', async () => {
    // Mock dependencies
    vi.spyOn(collection, 'creationTimestamp').mockResolvedValue(
      new Date('2022-12-25T00:00:00Z').getTime(),
    )
    vi.spyOn(collection, 'getConf').mockImplementation(
      async (key, defaultValue) => {
        if (key === 'rollover') return 4
        if (key === 'creationOffset') return 0
        return defaultValue
      },
    )

    const result = await collectionCreatedAt()

    // 7 days between Dec 25 and Jan 1
    expect(result.today).toBe(7)

    // Cutoff should be next day at 4am
    const expectedCutoff = new Date('2023-01-02T04:00:00Z').getTime()
    expect(result.dayCutoff).toBe(expectedCutoff)
  })

  it('rolloverHour returns configured rollover hour', async () => {
    vi.spyOn(collection, 'getConf').mockResolvedValue(6) // 6am rollover

    const hour = await rolloverHour()

    expect(hour).toBe(6)
  })
})

describe('real-world scenarios', () => {
  let card

  beforeEach(() => {
    card = new MockCard()
    vi.spyOn(global, 'mToday', 'get').mockReturnValue(10)
    vi.spyOn(global, 'mDayCutoff', 'get').mockReturnValue(
      Date.now() + 24 * 60 * 60 * 1000,
    )
    vi.spyOn(collection, 'getColKey').mockResolvedValue(0)
    vi.spyOn(wankidb.revlog, 'add').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('simulates a complete learning cycle for a new card', async () => {
    // Start with a new card
    card.type = CardType.New
    card.queue = QueueType.New

    // Custom config with 3 learning steps: 1m, 10m, 1d
    const customConfig = {
      ...defaultDeckConfig,
      new: {
        ...defaultDeckConfig.new,
        delays: [1, 10, 1440], // 1min, 10min, 1day
      },
    }

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(customConfig)

    // Mock necessary functions
    vi.spyOn(global, '_startingLeft').mockResolvedValue(3) // 3 steps
    vi.spyOn(global, '_rescheduleLrnCard').mockResolvedValue(60)
    vi.spyOn(global, '_moveToNextStep').mockImplementation(() => {
      card.left -= 1
    })
    vi.spyOn(global, '_rescheduleAsRev').mockImplementation(() => {
      card.type = CardType.Review
      card.queue = QueueType.Review
      card.ivl = 1
      card.due = 11 // mToday + ivl
    })

    // First review: Again (Ease.One)
    await answerCard(card, Ease.One)
    expect(card.type).toBe(CardType.Learn)
    expect(card.queue).toBe(QueueType.Learn)
    expect(card.left).toBe(3)

    // Second review: Hard (Ease.Two)
    await answerCard(card, Ease.Two)
    expect(card.type).toBe(CardType.Learn)
    expect(card.queue).toBe(QueueType.Learn)
    expect(card.left).toBe(3) // Repeats the step

    // Third review: Good (Ease.Three)
    await answerCard(card, Ease.Three)
    expect(card.type).toBe(CardType.Learn)
    expect(card.queue).toBe(QueueType.Learn)
    expect(card.left).toBe(2) // Moves to next step

    // Fourth review: Good (Ease.Three)
    await answerCard(card, Ease.Three)
    expect(card.type).toBe(CardType.Learn)
    expect(card.queue).toBe(QueueType.Learn)
    expect(card.left).toBe(1) // Moves to next step

    // Fifth review: Good (Ease.Three) - Graduates
    await answerCard(card, Ease.Three)
    expect(card.type).toBe(CardType.Review)
    expect(card.queue).toBe(QueueType.Review)
    expect(card.ivl).toBe(1)
    expect(card.due).toBe(11)
  })

  it('simulates a review card going through a lapse and relearning', async () => {
    // Start with a review card
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 10
    card.factor = 2500
    card.due = 5

    // Custom config with 2 relearning steps: 10m, 1d
    const customConfig = {
      ...defaultDeckConfig,
      lapse: {
        ...defaultDeckConfig.lapse,
        delays: [10, 1440], // 10min, 1day
        minInt: 1,
        mult: 0.5,
      },
    }

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(customConfig)

    // Mock necessary functions
    vi.spyOn(global, '_startingLeft').mockResolvedValue(2) // 2 steps
    vi.spyOn(global, '_rescheduleLrnCard').mockResolvedValue(600)
    vi.spyOn(global, '_moveToNextStep').mockImplementation(() => {
      card.left -= 1
    })
    vi.spyOn(global, '_rescheduleAsRev').mockImplementation(() => {
      card.type = CardType.Review
      card.queue = QueueType.Review
      card.due = 15 // mToday + ivl
    })
    vi.spyOn(global, '_updateRevIvlOnFail').mockImplementation(() => {
      card.lastIvl = card.ivl
      card.ivl = 5 // 10 * 0.5 = 5
    })

    // First review: Again (Ease.One) - Card lapses
    await answerCard(card, Ease.One)
    expect(card.type).toBe(CardType.Relearning)
    expect(card.queue).toBe(QueueType.Learn)
    expect(card.left).toBe(2)
    expect(card.lapses).toBe(1)
    expect(card.factor).toBe(2300) // 2500 - 200
    expect(card.ivl).toBe(5) // 10 * 0.5 = 5

    // Second review: Good (Ease.Three)
    await answerCard(card, Ease.Three)
    expect(card.type).toBe(CardType.Relearning)
    expect(card.queue).toBe(QueueType.Learn)
    expect(card.left).toBe(1) // Moves to next step

    // Third review: Good (Ease.Three) - Graduates from relearning
    await answerCard(card, Ease.Three)
    expect(card.type).toBe(CardType.Review)
    expect(card.queue).toBe(QueueType.Review)
    expect(card.due).toBe(15)
  })

  it('simulates early review of a card', async () => {
    // Start with a review card due in the future
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 20
    card.factor = 2500
    card.due = 20 // Due 10 days from now

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(defaultDeckConfig)
    vi.spyOn(global, '_daysLate').mockReturnValue(-10) // Due 10 days from now

    // Mock _rescheduleRev to capture the new interval
    let newIvl
    vi.spyOn(global, '_rescheduleRev').mockImplementation(
      (card, ease, early) => {
        newIvl = card.ivl
      },
    )

    // Review early with Good (Ease.Three)
    await answerCard(card, Ease.Three)

    // Interval should be calculated using _earlyReviewIvl
    // With 10 days remaining, the interval should be adjusted
    expect(global._rescheduleRev).toHaveBeenCalledWith(card, Ease.Three, true)
  })

  it('simulates a card becoming a leech', async () => {
    // Start with a review card that's about to become a leech
    card.type = CardType.Review
    card.queue = QueueType.Review
    card.ivl = 10
    card.factor = 2500
    card.lapses = 7 // One more lapse will trigger leech threshold

    vi.spyOn(collection, 'cardDeckConfig').mockResolvedValue(defaultDeckConfig)
    vi.spyOn(globalstate, 'addToast').mockImplementation(() => {})

    // Mock necessary functions
    vi.spyOn(global, '_startingLeft').mockResolvedValue(1)
    vi.spyOn(global, '_rescheduleLrnCard').mockResolvedValue(600)

    // Review with Again (Ease.One) - Card should become a leech
    await answerCard(card, Ease.One)

    expect(card.lapses).toBe(8)
    expect(card.note.addTag).toHaveBeenCalledWith('leech')
    expect(card.queue).toBe(QueueType.Suspended)
    expect(globalstate.addToast).toHaveBeenCalled()
  })
})
