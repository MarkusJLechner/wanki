import {
  Consts,
  QueueType,
  CardType,
  Ease,
  Leech,
  NewCardOrder,
  UnburyType,
  FACTOR_ADDITION_VALUES,
  RESCHEDULE_FACTOR,
  SECONDS_PER_DAY,
  DYN_OLDEST,
  DYN_RANDOM,
  DYN_SMALLINT,
  DYN_BIGINT,
  DYN_LAPSES,
  DYN_ADDED,
  DYN_DUEPRIORITY,
  DYN_DUE,
} from './conts.js'
import { wankidb } from './wankidb/db.js'
import { Card } from './wankidb/Card.js' // Assuming Card.js is correctly imported by wankidb hook
import { Deck } from './wankidb/Deck.js' // Assuming Deck.js is correctly imported by wankidb hook
import { Col } from './wankidb/Col.js' // Assuming Col.js is correctly imported by wankidb hook
// Note and Model classes might be needed for some operations like leech tagging or dynamic deck search term parsing
import { Note } from './wankidb/Note.js'
import { Model } from './wankidb/Model.js'

import {
  cardDeckConfig as getCardDeckConfigUtil, // Renamed to avoid conflict if used as method
  deckConfig as getDeckConfigUtil,
  getCol as getColUtil,
  getColKey as getColKeyUtil,
  creationTimestamp as getCreationTimestampUtil,
  getConf as getConfUtil,
  setConf as setConfUtil,
  getDecks as getDecksUtil,
} from './collection.js'

import {
  log as logUtil,
  info as infoUtil,
  warn as warnUtil,
  error as errorUtil,
} from './log.js'

// LrnCardQueue is a singleton export from your file
import LrnCardQueueSingleton from './classes/LrnCardQueue.js' // Path might need adjustment
import { LrnCard } from './classes/LrnCard.js' // Used by LrnCardQueue and SchedV2

// SimpleCardQueue remains as a class instantiated by SchedV2
class SimpleCardQueue {
  constructor(scheduler) {
    this.scheduler = scheduler
    this._queue = []
  }
  add(cardId) {
    this._queue.push(cardId)
  }
  remove(cardId) {
    this._queue = this._queue.filter((id) => id !== cardId)
  }
  clear() {
    this._queue = []
  }
  isEmpty() {
    return this._queue.length === 0
  }
  get length() {
    return this._queue.length
  }
  shuffle(randomInstance = Math.random) {
    for (let i = this._queue.length - 1; i > 0; i--) {
      const j = Math.floor(randomInstance() * (i + 1))
      ;[this._queue[i], this._queue[j]] = [this._queue[j], this._queue[i]]
    }
  }
  async removeFirstCard() {
    if (this.isEmpty()) return null
    const cardId = this._queue.shift()
    // Card instances are automatically created by Dexie hooks when reading from wankidb
    return wankidb.cards.get(cardId)
  }
  async loadFirstCard() {
    /* Pre-fetching not strictly needed with Dexie direct get */
  }
}

class SchedV2 {
  constructor() {
    // No 'col' parameter needed if we directly use imported wankidb and collection utils
    this.mQueueLimit = 50
    this.mReportLimit = 99999
    this.mDynReportLimit = 99999
    this.mReps = 0
    this.mToday = null
    this.mDayCutoff = 0
    this.mLrnCutoff = 0
    this.mHaveQueues = false
    this.mHaveCounts = false
    this.mNewCount = 0
    this.mLrnCount = 0
    this.mRevCount = 0
    this.mNewCardModulus = 0
    this.mEtaCache = [-1, -1, -1, -1, -1, -1]
    this.mNewQueue = new SimpleCardQueue(this)
    this.mLrnQueue = LrnCardQueueSingleton // Use the singleton
    this.mLrnDayQueue = new SimpleCardQueue(this)
    this.mRevQueue = new SimpleCardQueue(this)
    this.mNewDids = []
    this.mLrnDids = []
    this.mCurrentCard = null
    this.mCurrentCardParentsDid = null
    this.mContextReference = null

    // Adapter for collection-level functionalities
    this.colAdapter = {
      // Time utilities
      time: {
        intTime: () => Math.floor(Date.now() / 1000),
        intTimeMillis: () => Date.now(),
        calendar: () => new Date(),
      },
      // Config access
      getConfValue: getConfUtil,
      setConfValue: setConfUtil,
      removeConfKey: async (key) => {
        // Assuming setConf can handle undefined to remove
        const col = await getColUtil()
        if (col && col.conf) {
          delete col.conf[key]
          await wankidb.col.put(col) // Save the modified col object
        }
      },
      // USN
      usn: async () => getColKeyUtil('usn', 0),
      // Creation timestamp
      getCrt: getCreationTimestampUtil, // Returns millis
      // Logging
      log: (obj) => infoUtil('SchedV2', obj), // Default to info, adjust as needed
      // Deck operations
      decks: {
        active: async () => {
          // This needs to be derived, e.g. from current deck and its children.
          // For now, returning all non-dynamic deck IDs as a placeholder.
          const decks = await wankidb.decks.filter((d) => d.dyn !== 1).toArray()
          return decks.map((d) => d.id)
        },
        get: async (did) => wankidb.decks.get(did),
        all: getDecksUtil,
        parents: async (did) => {
          // TODO: Implement deck parent traversal logic if not provided by collection.js
          // This is complex as it requires parsing deck names.
          // For now, returning empty array as a placeholder.
          console.warn('colAdapter.decks.parents() not fully implemented.')
          return []
        },
        children: async (did) => {
          // TODO: Implement deck children traversal
          console.warn('colAdapter.decks.children() not fully implemented.')
          return {} // name:id map
        },
        childDids: async (did) => {
          console.warn('colAdapter.decks.childDids() not fully implemented.')
          const deck = await wankidb.decks.get(did)
          if (!deck) return [did]
          const allDecks = await getDecksUtil()
          const children = []
          const prefix = deck.name + '::'
          for (const d of allDecks) {
            if (d.name.startsWith(prefix)) {
              children.push(d.id)
            }
          }
          return [did, ...children]
        },
        selected: async () => getColKeyUtil('curDeck', 1), // Default to deck 1 if not set
        select: async (did) => {
          const col = await getColUtil()
          col.curDeck = did
          await wankidb.col.put(col)
        },
        confForDid: getDeckConfigUtil, // Uses your collection.js function
        didsForConf: async (deckConfigObj) => {
          // Find all decks that use this specific config object (by ID)
          const allDecks = await getDecksUtil()
          return allDecks
            .filter((d) => d.conf === deckConfigObj.id)
            .map((d) => d.id)
        },
        current: async () => {
          const curDeckId = await getColKeyUtil('curDeck', 1)
          return wankidb.decks.get(curDeckId)
        },
      },
      // Note operations
      getNote: async (nid) => wankidb.notes.get(nid),
      // Backend (for timezone, this was specific to AnkiDroid's Rust backend)
      // We'll use the JS-native way from your scheduler.js for now.
      backend: {
        sched_timing_today: async (
          crt,
          creationOffset,
          nowSec,
          currentOffset,
          rolloverHour,
        ) => {
          // This logic is from your `scheduler.js`'s `sched_timing_today`
          const collectionTimestamp = new Date(crt) // crt is already millis from getCreationTimestampUtil
          const colCreated = new Date(
            collectionTimestamp.getTime() + creationOffset * 60000,
          )

          let rollover = new Date().setHours(rolloverHour, 0, 0, 0)
          let nowMillis = Date.now() // current time in millis
          let isRolloverPassed = rollover <= nowMillis

          const durationDayMillis = Consts.SECONDS_PER_DAY * 1000
          const nextDayTimestampMillis = isRolloverPassed
            ? rollover + durationDayMillis
            : rollover

          const diffDays = (targetDate, sourceDate, isRolloverPassedFlag) => {
            let days =
              (targetDate.getTime() - sourceDate.getTime()) / durationDayMillis
            days = isRolloverPassedFlag ? days : days - 1
            return Math.floor(Math.max(0, days))
          }

          return {
            days_elapsed: diffDays(
              new Date(nowMillis),
              colCreated,
              isRolloverPassed,
            ),
            next_day_at: Math.floor(nextDayTimestampMillis / 1000), // to seconds
          }
        },
        local_minutes_west: async (timestampSec) => {
          // JavaScript's Date.getTimezoneOffset() returns minutes EAST of UTC.
          // We need minutes WEST.
          return -new Date(timestampSec * 1000).getTimezoneOffset()
        },
      },
      setMod: async () => {
        // Mark collection as modified
        const col = await getColUtil()
        col.mod = this.colAdapter.time.intTime()
        await wankidb.col.put(col)
      },
    }
  }

  async init() {
    await this._updateCutoff()
  }

  getCol() {
    return this.colAdapter
  } // Provide the adapter
  getName() {
    return 'std2'
  }
  getToday() {
    return this.mToday
  }
  setToday(today) {
    this.mToday = today
  }
  getDayCutoff() {
    return this.mDayCutoff
  }
  getReps() {
    return this.mReps
  }
  incrReps() {
    this.mReps++
  }
  decrReps() {
    this.mReps--
  }

  setContext(contextRef) {
    this.mContextReference = contextRef
  }
  setReportLimit(limit) {
    this.mReportLimit = limit
  }
  getGoodNewButton() {
    return Consts.BUTTON_THREE
  }

  async logCount() {
    return wankidb.revlog.count()
  }

  async _timingToday() {
    try {
      return await this.colAdapter.backend.sched_timing_today(
        await this.colAdapter.getCrt(),
        await this._creation_timezone_offset(),
        this.colAdapter.time.intTime(),
        await this._current_timezone_offset(),
        await this._rolloverHour(),
      )
    } catch (e) {
      console.warn('sched_timing_today failed:', e)
      return null
    }
  }
  async _creation_timezone_offset() {
    return this.colAdapter.getConfValue('creationOffset', 0)
  }
  async _current_timezone_offset() {
    // const isServer = await this.colAdapter.getConfValue("isServer", false); // Example if you had such a config
    // if (isServer) { return await this.colAdapter.getConfValue("localOffset", 0); }
    return this.colAdapter.backend.local_minutes_west(
      this.colAdapter.time.intTime(),
    )
  }
  async _rolloverHour() {
    return this.colAdapter.getConfValue('rollover', 4)
  }

  async _daysSinceCreation() {
    const crtCalendar = new Date(await this.colAdapter.getCrt())
    crtCalendar.setHours(await this._rolloverHour(), 0, 0, 0)
    const diffMillis =
      this.colAdapter.time.intTimeMillis() - crtCalendar.getTime()
    return Math.floor(diffMillis / 1000 / Consts.SECONDS_PER_DAY)
  }

  async _dayCutoff() {
    let rollover = await this.colAdapter.getConfValue('rollover', 4)
    const now = this.colAdapter.time.calendar()
    const cutoff = new Date(now.getTime())
    cutoff.setHours(rollover, 0, 0, 0)
    if (cutoff.getTime() <= now.getTime()) {
      cutoff.setDate(cutoff.getDate() + 1)
    }
    return Math.floor(cutoff.getTime() / 1000)
  }

  async _new_timezone_enabled() {
    const offset = await this.colAdapter.getConfValue('creationOffset', null)
    return offset !== null
  }
  async set_creation_offset() {
    const mins_west = await this.colAdapter.backend.local_minutes_west(
      (await this.colAdapter.getCrt()) / 1000,
    )
    await this.colAdapter.setConfValue('creationOffset', mins_west)
    await this.colAdapter.setMod()
  }
  async clear_creation_offset() {
    if ((await this.colAdapter.getConfValue('creationOffset', null)) !== null) {
      await this.colAdapter.removeConfKey('creationOffset')
      await this.colAdapter.setMod()
    }
  }

  async _updateCutoff() {
    const oldToday = this.mToday === null ? 0 : this.mToday
    const timing = await this._timingToday()

    if (timing === null) {
      this.mToday = await this._daysSinceCreation()
      this.mDayCutoff = await this._dayCutoff()
    } else if (await this._new_timezone_enabled()) {
      this.mToday = timing.days_elapsed
      this.mDayCutoff = timing.next_day_at
    } else {
      this.mToday = await this._daysSinceCreation()
      this.mDayCutoff = await this._dayCutoff()
    }

    if (oldToday !== this.mToday) {
      this.colAdapter.log({
        type: 'cutoffUpdate',
        today: this.mToday,
        dayCutoff: this.mDayCutoff,
      })
    }

    const decks = await this.colAdapter.decks.all()
    for (const deck of decks) {
      // deck here is a raw object from Dexie, not a Deck instance unless hooked
      const deckInstance = new Deck() // Create instance to use its methods/properties
      Object.assign(deckInstance, deck)
      this._updateDeckDailyStats(deckInstance)
      await deckInstance.save() // Persist changes if any
    }

    const lastUnburied = await this.colAdapter.getConfValue('lastUnburied', 0)
    if (lastUnburied < this.mToday) {
      await this.unburyCards()
      await this.colAdapter.setConfValue('lastUnburied', this.mToday)
    }
  }

  _updateDeckDailyStats(deckInstance) {
    // deckInstance is an instance of your Deck class
    ;['new', 'rev', 'lrn', 'time'].forEach((t) => {
      const key = `${t}Today` // e.g., newToday
      let tTodayArray = deckInstance[key] // Direct property access
      if (
        !tTodayArray ||
        !Array.isArray(tTodayArray) ||
        tTodayArray[0] !== this.mToday
      ) {
        deckInstance[key] = [this.mToday, 0]
      }
    })
    // The actual save is done in _updateCutoff loop after calling this
  }

  async _checkDay() {
    if (this.colAdapter.time.intTime() > this.mDayCutoff) {
      await this.reset()
    }
  }

  async reset() {
    await this._updateCutoff()
    await this.resetCounts(false)
    await this.resetQueues(false)
  }

  async resetCounts(checkCutoffOrCancelListener = true) {
    if (
      typeof checkCutoffOrCancelListener === 'boolean' &&
      checkCutoffOrCancelListener
    ) {
      await this._updateCutoff()
    }
    this.mHaveCounts = false
    await this._resetLrnCount()
    await this._resetRevCount()
    await this._resetNewCount()
    this.mHaveCounts = true
  }

  async resetQueues(checkCutoff = true) {
    if (checkCutoff && this.colAdapter.time.intTime() > this.mDayCutoff) {
      // Check again just in case
      await this._updateCutoff()
    }
    await this._resetLrnQueue()
    this._resetRevQueue() // This one is synchronous
    await this._resetNewQueue()
    this.mHaveQueues = true
  }

  async deferReset(card = null) {
    this.mHaveQueues = false
    this.mHaveCounts = false
    if (card) {
      await this.setCurrentCard(card)
    } else {
      this.discardCurrentCard()
    }
  }

  async _updateLrnCutoff(force = false) {
    const collapseTime = await this.colAdapter.getConfValue(
      'collapseTime',
      1200,
    )
    const nextCutoff = this.colAdapter.time.intTime() + collapseTime
    if (nextCutoff - this.mLrnCutoff > 60 || force) {
      this.mLrnCutoff = nextCutoff
      return true
    }
    return false
  }

  async _currentCardId() {
    return this.mCurrentCard ? this.mCurrentCard.id : 0
  }
  async _currentCardNid() {
    return this.mCurrentCard ? this.mCurrentCard.nid : 0
  }

  async _deckLimit() {
    const activeDids = await this.colAdapter.decks.active()
    if (!activeDids || activeDids.length === 0) return [] // Return empty array for Dexie anyOf
    return activeDids
  }

  // Dexie-based count resets
  async _resetLrnCount() {
    await this._updateLrnCutoff(true)
    const activeDids = await this._deckLimit()
    let count = 0
    if (activeDids.length > 0) {
      const currentCardId = await this._currentCardId()
      count = await wankidb.cards
        .where('did')
        .anyOf(activeDids)
        .and(
          (c) =>
            c.queue === Consts.QUEUE_TYPE_LRN &&
            c.id !== currentCardId &&
            c.due < this.mLrnCutoff,
        )
        .count()
      count += await wankidb.cards
        .where('did')
        .anyOf(activeDids)
        .and(
          (c) =>
            c.queue === Consts.QUEUE_TYPE_DAY_LEARN_RELEARN &&
            c.id !== currentCardId &&
            c.due <= this.mToday,
        )
        .count()
      count += await wankidb.cards
        .where('did')
        .anyOf(activeDids)
        .and(
          (c) =>
            c.queue === Consts.QUEUE_TYPE_PREVIEW && c.id !== currentCardId,
        )
        .count()
    }
    this.mLrnCount = count
  }

  async _resetRevCount(cancelListener = null) {
    const lim = await this._currentRevLimit(true)
    if (
      cancelListener &&
      cancelListener.isCancelled &&
      cancelListener.isCancelled()
    ) {
      this.mRevCount = 0
      return
    }
    const activeDids = await this._deckLimit()
    this.mRevCount = 0
    if (lim > 0 && activeDids.length > 0) {
      const currentCardId = await this._currentCardId()
      // Dexie doesn't directly support LIMIT within a more complex filter for count.
      // We might need to fetch and then count, or use a more complex Dexie add-on if performance is an issue.
      // For now, fetching up to the limit and counting.
      const cards = await wankidb.cards
        .where('did')
        .anyOf(activeDids)
        .and(
          (c) =>
            c.queue === Consts.QUEUE_TYPE_REV &&
            c.due <= this.mToday &&
            c.id !== currentCardId,
        )
        .limit(lim)
        .toArray()
      this.mRevCount = cards.length
    }
  }

  async _cntFnNew(did, lim) {
    const currentCardId = await this._currentCardId()
    const cards = await wankidb.cards
      .where({ did: did, queue: Consts.QUEUE_TYPE_NEW })
      .and((c) => c.id !== currentCardId)
      .limit(lim)
      .toArray()
    return cards.length
  }

  async _deckNewLimitSingle(deckObj, considerCurrentCard) {
    // deckObj is an instance of your Deck class
    if (deckObj.dyn === 1) return this.mDynReportLimit

    const deckId = deckObj.id
    const conf = await this.colAdapter.decks.confForDid(deckId) // DeckConfig for this deck
    const newTodayStats = deckObj.newToday || [this.mToday, 0] // [day, count]

    let limit = Math.max(0, conf.new.perDay - newTodayStats[1])

    if (
      considerCurrentCard &&
      this.mCurrentCard &&
      this.mCurrentCard.queue === Consts.QUEUE_TYPE_NEW &&
      this.mCurrentCardParentsDid &&
      this.mCurrentCardParentsDid.includes(deckId)
    ) {
      limit--
    }
    return Math.max(0, limit)
  }

  async _resetNewCount(cancelListener = null) {
    const limFn = async (deckInstance) =>
      this._deckNewLimitSingle(deckInstance, true)
    const cntFn = async (did, lim) => this._cntFnNew(did, lim)
    this.mNewCount = await this._walkingCount(limFn, cntFn, cancelListener)
    if (this.mNewCount === -1 && cancelListener) this.mNewCount = 0
  }

  async _resetLrnQueue() {
    this.mLrnQueue.clear() // Assuming LrnCardQueueSingleton
    this.mLrnDayQueue.clear()
    this.mLrnDids = await this.colAdapter.decks.active()
  }
  _resetRevQueue() {
    this.mRevQueue.clear()
  }
  async _resetNewQueue() {
    this.mNewDids = await this.colAdapter.decks.active()
    this.mNewQueue.clear()
    await this._updateNewCardRatio()
  }

  // ... (getCard, _getCardInternal - largely same structure, but Card.load becomes wankidb.cards.get)

  async _fillLrn() {
    if (this.mHaveCounts && this.mLrnCount === 0) return false
    if (!this.mLrnQueue.isEmpty()) return true

    const collapseTime = await this.colAdapter.getConfValue(
      'collapseTime',
      1200,
    )
    const cutoff = this.colAdapter.time.intTime() + collapseTime
    this.mLrnQueue.clear()
    const activeDids = await this._deckLimit()
    const currentCardId = await this._currentCardId()

    if (activeDids.length > 0) {
      const cardsData = await wankidb.cards
        .where('did')
        .anyOf(activeDids)
        .and(
          (c) =>
            (c.queue === Consts.QUEUE_TYPE_LRN ||
              c.queue === Consts.QUEUE_TYPE_PREVIEW) &&
            c.due < cutoff &&
            c.id !== currentCardId,
        )
        .limit(this.mReportLimit) // Apply limit if possible, or sort and slice after fetching
        .sortBy('due') // Fetch sorted by due

      cardsData.forEach((c) => this.mLrnQueue.add(c.due, c.id)) // Add already sorts if singleton is used
      // If mLrnQueue.add doesn't sort, call this.mLrnQueue.sort();
    }
    this.mLrnQueue.setFilled()
    return !this.mLrnQueue.isEmpty()
  }

  async _fillLrnDay() {
    if (this.mHaveCounts && this.mLrnCount === 0) return false
    if (!this.mLrnDayQueue.isEmpty()) return true

    const currentCardId = await this._currentCardId()
    while (this.mLrnDids.length > 0) {
      const did = this.mLrnDids[0]
      this.mLrnDayQueue.clear()
      const cardIds = (
        await wankidb.cards
          .where({ did: did, queue: Consts.QUEUE_TYPE_DAY_LEARN_RELEARN })
          .and((c) => c.due <= this.mToday && c.id !== currentCardId)
          .limit(this.mQueueLimit)
          .toArray()
      ).map((c) => c.id)

      cardIds.forEach((cid) => this.mLrnDayQueue.add(cid))

      if (!this.mLrnDayQueue.isEmpty()) {
        // TODO: Seeded random shuffle based on mToday for deterministic behavior
        this.mLrnDayQueue.shuffle()
        if (this.mLrnDayQueue.length < this.mQueueLimit) {
          this.mLrnDids.shift()
        }
        return true
      }
      this.mLrnDids.shift()
    }
    return false
  }

  async _fillNew(allowSibling = false) {
    if (!this.mNewQueue.isEmpty()) return true
    if (this.mHaveCounts && this.mNewCount === 0) return false

    const currentCardId = await this._currentCardId()
    const currentCardNid = await this._currentCardNid()

    while (this.mNewDids.length > 0) {
      const did = this.mNewDids[0]
      const deck = await this.colAdapter.decks.get(did)
      if (!deck) {
        this.mNewDids.shift()
        continue
      }

      const limit = Math.min(
        this.mQueueLimit,
        await this._deckNewLimitSingle(deck, true),
      )

      if (limit > 0) {
        this.mNewQueue.clear()
        const idToExclude = allowSibling ? currentCardId : currentCardNid

        const cardsQuery = wankidb.cards
          .where({ did: did, queue: Consts.QUEUE_TYPE_NEW })
          .and((c) => (allowSibling ? c.id : c.nid) !== idToExclude)
          .orderBy('due')
          .add('ord') // Dexie might need compound index or multiple orderBy calls
          .limit(limit)

        const cardIds = (await cardsQuery.toArray()).map((c) => c.id)
        cardIds.forEach((cid) => this.mNewQueue.add(cid))

        if (!this.mNewQueue.isEmpty()) return true
      }
      this.mNewDids.shift()
    }

    if (this.mHaveCounts && this.mNewCount !== 0 && !allowSibling) {
      await this._resetNewQueue()
      return this._fillNew(true)
    }
    return false
  }

  async _fillRev(allowSibling = false) {
    if (!this.mRevQueue.isEmpty()) return true
    if (this.mHaveCounts && this.mRevCount === 0) return false

    const currentCardId = await this._currentCardId()
    const currentCardNid = await this._currentCardNid()
    const activeDids = await this._deckLimit()

    const limit = Math.min(this.mQueueLimit, await this._currentRevLimit(true))
    if (limit > 0 && activeDids.length > 0) {
      this.mRevQueue.clear()
      const idToExclude = allowSibling ? currentCardId : currentCardNid

      // ORDER BY due, random() is tricky in Dexie.
      // Fetch by due, then shuffle a limited set.
      let cards = await wankidb.cards
        .where('did')
        .anyOf(activeDids)
        .and(
          (c) =>
            c.queue === Consts.QUEUE_TYPE_REV &&
            c.due <= this.mToday &&
            (allowSibling ? c.id : c.nid) !== idToExclude,
        )
        .sortBy('due') // Get all matching, then limit and shuffle client-side

      // Shuffle and limit
      for (let i = cards.length - 1; i > 0; i--) {
        // Fisher-Yates shuffle
        const j = Math.floor(Math.random() * (i + 1))
        ;[cards[i], cards[j]] = [cards[j], cards[i]]
      }
      cards = cards.slice(0, limit)

      cards.forEach((c) => this.mRevQueue.add(c.id))
      if (!this.mRevQueue.isEmpty()) return true
    }

    if (this.mHaveCounts && this.mRevCount !== 0 && !allowSibling) {
      await this._resetRev()
      return this._fillRev(true)
    }
    return false
  }

  // ... (answerCard, _answerCardInternal - methods will call save on card object after modification) ...
  // e.g., card.setQueue(Consts.QUEUE_TYPE_LRN); await card.save();
  // All methods that modify card properties directly will need 'await card.save()'

  async _answerLrnCard(card, ease) {
    // ... (logic as before)
    // When card properties like 'left', 'due', 'queue', 'type', 'ivl', 'factor' are set:
    // card.left = ...; card.due = ...; etc.
    // Ensure at the end of modifications within this scope, or before returning from a path:
    await card.save() // Or batch saves if appropriate for performance.
  }
  async _answerRevCard(card, ease) {
    // ... (logic as before)
    await card.save()
  }
  async _answerCardPreview(card, ease) {
    // ...
    await card.save()
  }

  // Ensure all card modifications are followed by `await card.save()`
  // Example for _moveToFirstStep:
  async _moveToFirstStep(card, conf) {
    card.left = await this._startingLeft(card) // Uses `this` which should be SchedV2 instance
    if (card.type === Consts.CARD_TYPE_RELEARNING) {
      this._updateRevIvlOnFail(card, conf)
    }
    // _rescheduleLrnCard will modify card.due and card.queue and should also call card.save() within it or before returning.
    const delay = await this._rescheduleLrnCard(card, conf) // _rescheduleLrnCard now needs to save
    return delay
  }

  async _rescheduleLrnCard(card, conf, delay = null) {
    if (delay === null) {
      delay = await this._delayForGrade(conf, card.left)
    }
    card.due = this.colAdapter.time.intTime() + delay

    if (card.due < this.mDayCutoff) {
      // ... (fuzz logic) ...
      card.queue = Consts.QUEUE_TYPE_LRN
      // ... (mLrnCount and _sortIntoLrn logic) ...
    } else {
      // ... (day learn logic) ...
      card.queue = Consts.QUEUE_TYPE_DAY_LEARN_RELEARN
    }
    await card.save() // Save changes to card
    return delay
  }

  // Logging
  async log(cardId, usn, ease, ivl, lastIvl, factor, timeTaken, type) {
    try {
      await wankidb.revlog.add({
        id: this.colAdapter.time.intTimeMillis(), // PK, ensure unique
        cid: cardId,
        usn,
        ease,
        ivl,
        lastIvl,
        factor,
        time,
        type,
      })
    } catch (e) {
      console.warn('Revlog insert failed, retrying once:', e)
      await new Promise((resolve) => setTimeout(resolve, 10))
      await wankidb.revlog.add({
        id: this.colAdapter.time.intTimeMillis() + 1, // Ensure PK is different on retry
        cid: cardId,
        usn,
        ease,
        ivl,
        lastIvl,
        factor,
        time,
        type,
      })
    }
  }

  // setCurrentCard and discardCurrentCard as before, but setCurrentCard is async
  async setCurrentCard(card) {
    this.mCurrentCard = card
    const did = card.did // Direct property access
    const parentDecksRaw = await this.colAdapter.decks.parents(did) // Array of deck objects/IDs
    this.mCurrentCardParentsDid = parentDecksRaw.map((p) => p.id)
    this.mCurrentCardParentsDid.push(did)

    await this._burySiblings(card)

    this.mRevQueue.remove(card.id)
    this.mNewQueue.remove(card.id)
    // mLrnQueue is singleton, handle its removal if necessary based on ID (not just {due,id} object)
    // LrnCardQueueSingleton.removeById(card.id); // If such a method exists
  }

  // Config access
  async _cardConf(card) {
    return this.colAdapter.decks.confForDid(card.did)
  }
  async _newConf(card) {
    const conf = await this._cardConf(card)
    if (!card.isInDynamicDeck()) {
      return conf.new
    }
    const oconf = await this.colAdapter.decks.confForDid(card.odid)
    return {
      /* ... merge logic as before ... */
    }
  }
  async _lapseConf(card) {
    /* ... similar adaptation ... */
  }
  async _revConf(card) {
    /* ... similar adaptation ... */
  }

  // Sibling Burying
  async _burySiblings(card) {
    if (!card) return
    const nid = card.nid
    if (!nid) return

    const nconf = await this._newConf(card)
    const buryNew = nconf.bury !== undefined ? nconf.bury : true
    const rconf = await this._revConf(card)
    const buryRev = rconf.bury !== undefined ? rconf.bury : true

    const currentCardId = await this._currentCardId() // Use the method which is async now

    const siblingsToConsider = await wankidb.cards
      .where({ nid: nid })
      .and(
        (c) =>
          c.id !== card.id &&
          (c.queue === Consts.QUEUE_TYPE_NEW ||
            (c.queue === Consts.QUEUE_TYPE_REV && c.due <= this.mToday)),
      )
      .toArray()

    const toBuryIds = []
    for (const sibling of siblingsToConsider) {
      if (sibling.queue === Consts.QUEUE_TYPE_REV) {
        this.mRevQueue.remove(sibling.id)
        if (buryRev) toBuryIds.push(sibling.id)
      } else {
        // QUEUE_TYPE_NEW
        this.mNewQueue.remove(sibling.id)
        if (buryNew) toBuryIds.push(sibling.id)
      }
    }
    if (toBuryIds.length > 0) await this.buryCards(toBuryIds, false)
  }

  async buryCards(cids, manual = true) {
    const queueToSet = manual
      ? Consts.QUEUE_TYPE_MANUALLY_BURIED
      : Consts.QUEUE_TYPE_SIBLING_BURIED
    this.colAdapter.log({ type: 'buryCards', cids, manual })
    await wankidb.cards
      .where('id')
      .anyOf(cids)
      .modify({
        queue: queueToSet,
        mod: this.colAdapter.time.intTime(),
        usn: await this.colAdapter.usn(),
      })
    cids.forEach((cid) => {
      /* remove from JS queues */
    })
  }

  // --- Dynamic Decks (using Dexie) ---
  async _dynOrder(orderType, limit) {
    // This now needs to translate to Dexie's orderBy/reverse/limit, not SQL snippet
    let orderByField
    let reverse = false
    switch (orderType) {
      case DYN_OLDEST:
        orderByField = 'mod'
        break
      case DYN_RANDOM:
        orderByField = null
        /* Handle random separately */ break
      case DYN_SMALLINT:
        orderByField = 'ivl'
        break
      case DYN_BIGINT:
        orderByField = 'ivl'
        reverse = true
        break
      case DYN_LAPSES:
        orderByField = 'lapses'
        reverse = true
        break
      case DYN_ADDED:
        orderByField = 'nid'
        /* approx by nid, or note.id if joined */ break
      case DYN_DUEPRIORITY:
        /* Complex, requires fetching and sorting in JS */ orderByField = null
        break
      case DYN_DUE:
      default:
        orderByField = 'due'
        break
    }
    return {
      orderByField,
      reverse,
      limit,
      isRandom: orderType === DYN_RANDOM,
      isDuePriority: orderType === DYN_DUEPRIORITY,
    }
  }

  async _fillDyn(deckInstance) {
    // deckInstance is an instance of your Deck class
    let currentDueOffset = -100000
    let totalFilled = 0
    const searchTerms = deckInstance.terms // [ [search, limit, order], ... ]

    for (const term of searchTerms) {
      const searchQueryStr = term[0] // This is an Anki search string
      const limit = term[1]
      const orderType = term[2]

      const orderParams = await this._dynOrder(orderType, limit)

      // findCards needs to parse Anki search query and convert to Dexie query
      // This is very complex. Placeholder for now.
      let cardIds = await this.colAdapter.findCards(searchQueryStr, orderParams) // Assuming findCards returns IDs

      if (!cardIds || cardIds.length === 0) continue

      this.colAdapter.log({
        type: 'fillDynTerm',
        deckId: deckInstance.id,
        term,
        found: cardIds.length,
      })
      await this._moveToDyn(
        deckInstance.id,
        cardIds,
        currentDueOffset + totalFilled,
        deckInstance.resched,
      )
      totalFilled += cardIds.length
    }
    return totalFilled
  }

  async _moveToDyn(targetDid, cardIds, startDue, rescheduleCards) {
    const currentUsnVal = await this.colAdapter.usn()
    const updates = []
    for (let i = 0; i < cardIds.length; i++) {
      const cardId = cardIds[i]
      const card = await wankidb.cards.get(cardId) // Get current card data
      if (card) {
        const updateOp = {
          id: cardId,
          odid: card.did,
          odue: card.due,
          did: targetDid,
          due: startDue + i, // Sorting key for filtered deck
          usn: currentUsnVal,
        }
        if (!rescheduleCards) {
          updateOp.queue = Consts.QUEUE_TYPE_REV // Force to preview
        }
        updates.push(updateOp)
      }
    }
    if (updates.length > 0) {
      await wankidb.cards.bulkPut(updates)
    }
  }

  // ... (rest of the methods, adapting DB queries to Dexie and using user's class properties/methods)
  // Example: sortCards would use wankidb.cards.where('id').anyOf(cids).toArray() then wankidb.cards.bulkPut(...)
  // Scheduler version changes (moveToV1, moveToV2) would require complex Dexie bulk updates or iterate-and-update logic.
}
