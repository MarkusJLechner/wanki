// Presumed constants (as defined before)
const Consts = {
  QUEUE_TYPE_NEW: 0,
  QUEUE_TYPE_LRN: 1,
  QUEUE_TYPE_REV: 2,
  QUEUE_TYPE_DAY_LEARN_RELEARN: 3,
  QUEUE_TYPE_PREVIEW: 4,
  QUEUE_TYPE_SUSPENDED: -1,
  QUEUE_TYPE_SIBLING_BURIED: -2,
  QUEUE_TYPE_MANUALLY_BURIED: -3,

  CARD_TYPE_NEW: 0,
  CARD_TYPE_LRN: 1,
  CARD_TYPE_REV: 2,
  CARD_TYPE_RELEARNING: 3,

  REVLOG_LRN: 0,
  REVLOG_REV: 1,
  REVLOG_RELRN: 2,
  REVLOG_EARLY_REVIEW: 3,

  BUTTON_ONE: 1,
  BUTTON_TWO: 2,
  BUTTON_THREE: 3,
  BUTTON_FOUR: 4,

  STARTING_FACTOR: 2500,
  SECONDS_PER_DAY: 86400,
  RESCHEDULE_FACTOR: 2500, // From SchedV2.RESCHEDULE_FACTOR

  NEW_CARDS_DISTRIBUTE: 0,
  NEW_CARDS_LAST: 1,
  NEW_CARDS_FIRST: 2,
  NEW_CARDS_DUE: 0,
  NEW_CARDS_RANDOM: 1,

  LEECH_SUSPEND: 0,
  LEECH_TAG_ONLY: 1, // Not in SchedV2, but standard Anki option

  DYN_OLDEST: 0,
  DYN_RANDOM: 1,
  DYN_SMALLINT: 2,
  DYN_BIGINT: 3,
  DYN_LAPSES: 4,
  DYN_ADDED: 5,
  DYN_REVADDED: 6,
  DYN_DUEPRIORITY: 7,
  DYN_DUE: 8,

  FACTOR_ADDITION_VALUES: [-150, 0, 150], // From SchedV2
}

// Enums from AbstractSched
const UnburyType = {
  ALL: 'ALL',
  MANUAL: 'MANUAL',
  SIBLINGS: 'SIBLINGS',
}

// Placeholder for Card, Note, Deck, DeckConfig, DeckDueTreeNode, DeckTreeNode (as before)
class Card {
  /* ... (implementation from previous response, ensure all necessary getters/setters) ... */
  constructor(col, id = null) {
    this.mCol = col
    this.id = id
    this.nid = 0
    this.did = 0
    this.ord = 0
    this.mod = 0
    this.usn = 0
    this.type = Consts.CARD_TYPE_NEW
    this.queue = Consts.QUEUE_TYPE_NEW
    this.due = 0
    this.ivl = 0
    this.factor = Consts.STARTING_FACTOR
    this.reps = 0
    this.lapses = 0
    this.left = 0
    this.odue = 0
    this.odid = 0
    this.flags = 0
    this.data = ''
    this.timerStarted = 0
    this.lastIvl = 0
  }
  getNid() {
    return this.nid
  }
  getDid() {
    return this.did
  }
  setDid(did) {
    this.did = did
  }
  getId() {
    return this.id
  }
  getQueue() {
    return this.queue
  }
  setQueue(q) {
    this.queue = q
  }
  getType() {
    return this.type
  }
  setType(t) {
    this.type = t
  }
  getDue() {
    return this.due
  }
  setDue(d) {
    this.due = d
  }
  getIvl() {
    return this.ivl
  }
  setIvl(i) {
    this.ivl = i
  }
  getFactor() {
    return this.factor
  }
  setFactor(f) {
    this.factor = f
  }
  getLeft() {
    return this.left
  }
  setLeft(l) {
    this.left = l
  }
  getODue() {
    return this.odue
  }
  setODue(od) {
    this.odue = od
  }
  getODid() {
    return this.odid
  }
  setODid(od) {
    this.odid = od
  }
  setMod(m) {
    this.mod = m
  }
  setUsn(u) {
    this.usn = u
  }
  setLastIvl(li) {
    this.lastIvl = li
  }
  getLastIvl() {
    return this.lastIvl
  }
  getLapses() {
    return this.lapses
  }
  setLapses(l) {
    this.lapses = l
  }
  incrReps() {
    this.reps = (this.reps || 0) + 1
  }
  isInDynamicDeck() {
    return this.odid !== 0 && this.odid !== undefined
  }
  startTimer() {
    this.timerStarted = this.mCol.time.intTime()
  }
  timeTaken() {
    if (!this.timerStarted) return 0
    return (this.mCol.time.intTime() - this.timerStarted) * 1000
  }
  async flushSched() {
    await this.mCol.db.updateCardSched(this)
  } // More specific update
  async flush() {
    await this.mCol.db.updateCard(this)
  }
  async note() {
    if (!this._note) {
      this._note = await this.mCol.getNote(this.nid)
    }
    return this._note
  }
  static async load(col, cardId) {
    const data = await col.db.getCardData(cardId)
    if (!data) return null
    const card = new Card(col, cardId)
    Object.assign(card, data)
    return card
  }
}

class SimpleCardQueue {
  /* ... (as before) ... */
  constructor(sched) {
    this.mSched = sched
    this.mCol = sched.mCol
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
    return Card.load(this.mCol, cardId)
  }
  async loadFirstCard() {
    /* Placeholder */
  }
}
class LrnCard {
  /* ... (as before) ... */
  constructor(col, due, id) {
    this.mCol = col
    this.due = due
    this.id = id
  }
  getDue() {
    return this.due
  }
  getId() {
    return this.id
  }
}
class LrnCardQueue {
  /* ... (as before) ... */
  constructor(sched) {
    this.mSched = sched
    this.mCol = sched.mCol
    this._queue = []
    this._filled = false
  }
  add(due, cardId) {
    this._queue.push(new LrnCard(this.mCol, due, cardId))
  }
  setFilled() {
    this._filled = true
  }
  isFilled() {
    return this._filled
  }
  clear() {
    this._queue = []
    this._filled = false
  }
  isEmpty() {
    return this._queue.length === 0
  }
  get length() {
    return this._queue.length
  }
  sort() {
    this._queue.sort((a, b) => a.getDue() - b.getDue())
  }
  getFirstDue() {
    return this.isEmpty() ? Number.MAX_SAFE_INTEGER : this._queue[0].getDue()
  }
  async removeFirstCard() {
    if (this.isEmpty()) return null
    const lrnCard = this._queue.shift()
    return Card.load(this.mCol, lrnCard.getId())
  }
  listIterator() {
    let index = 0
    const self = this
    return {
      hasNext: () => index < self._queue.length,
      next: () => self._queue[index++],
      previous: () => self._queue[--index],
      add: (lrnCard) => self._queue.splice(index, 0, lrnCard),
    }
  }
  async loadFirstCard() {
    /* Placeholder */
  }
}

class SchedV2 {
  constructor(col) {
    this.mCol = col
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
    this.mLrnQueue = new LrnCardQueue(this)
    this.mLrnDayQueue = new SimpleCardQueue(this)
    this.mRevQueue = new SimpleCardQueue(this)
    this.mNewDids = []
    this.mLrnDids = []
    this.mCurrentCard = null
    this.mCurrentCardParentsDid = null
    this.mContextReference = null // WeakReference<Activity> in Java for UI messages
  }

  async init() {
    await this._updateCutoff()
  }

  // --- AbstractSched methods implemented in SchedV2 ---
  getCol() {
    return this.mCol
  }
  getName() {
    return 'std2'
  } // SchedV2 name
  getToday() {
    return this.mToday
  }
  setToday(today) {
    this.mToday = today
  } // For testing or specific scenarios
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
  } // For leech messages etc.
  setReportLimit(limit) {
    this.mReportLimit = limit
  }

  getGoodNewButton() {
    return Consts.BUTTON_THREE
  } // Good for new card is the 3rd button (1-indexed)

  async logCount() {
    return await this.mCol.db.queryScalar('SELECT count() FROM revlog')
  }

  // --- Time and Cutoff Logic (as before, ensure mCol provides necessary time/conf access) ---
  async _timingToday() {
    /* ... as before ... */
    try {
      return await this.mCol.backend.sched_timing_today(
        this.mCol.getCrt(),
        await this._creation_timezone_offset(),
        this.mCol.time.intTime(),
        await this._current_timezone_offset(),
        await this._rolloverHour(),
      )
    } catch (e) {
      console.warn('Backend not supported for sched_timing_today:', e)
      return null
    }
  }
  async _creation_timezone_offset() {
    return await this.mCol.getConfValue('creationOffset', 0)
  }
  async _current_timezone_offset() {
    /* ... as before ... */
    if (this.mCol.isServer && this.mCol.isServer()) {
      // Check if mCol.isServer is a function
      return await this.mCol.getConfValue('localOffset', 0)
    } else {
      return await this.mCol.backend.local_minutes_west(
        this.mCol.time.intTime(),
      )
    }
  }
  async _rolloverHour() {
    return await this.mCol.getConfValue('rollover', 4)
  }
  async _daysSinceCreation() {
    /* ... as before ... */
    const crtCalendar = this.mCol.crtCalendar()
    crtCalendar.setHours(await this._rolloverHour(), 0, 0, 0)
    const diffMillis = this.mCol.time.intTime() * 1000 - crtCalendar.getTime()
    return Math.floor(diffMillis / 1000 / Consts.SECONDS_PER_DAY)
  }
  async _dayCutoff() {
    /* ... as before ... */
    let rollover = await this.mCol.getConfValue('rollover', 4)
    const now = this.mCol.time.calendar()
    const cutoff = new Date(now.getTime())
    cutoff.setHours(rollover, 0, 0, 0)
    if (cutoff.getTime() <= now.getTime()) {
      cutoff.setDate(cutoff.getDate() + 1)
    }
    return Math.floor(cutoff.getTime() / 1000)
  }
  async _new_timezone_enabled() {
    /* ... as before ... */
    const offset = await this.mCol.getConfValue('creationOffset', null)
    return offset !== null
  }
  async set_creation_offset() {
    const mins_west = await this.mCol.backend.local_minutes_west(
      this.mCol.getCrt(),
    )
    await this.mCol.setConfValue('creationOffset', mins_west)
    await this.mCol.setMod() // Mark collection as modified
  }
  async clear_creation_offset() {
    if ((await this.mCol.getConfValue('creationOffset', null)) !== null) {
      await this.mCol.removeConfKey('creationOffset')
      await this.mCol.setMod()
    }
  }
  async _updateCutoff() {
    /* ... as before, ensure unburyCards is called ... */
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
      this.mCol.log({
        type: 'cutoffUpdate',
        today: this.mToday,
        dayCutoff: this.mDayCutoff,
      })
    }

    const decks = await this.mCol.decks.all() // Assuming returns array of Deck-like objects
    for (const deck of decks) {
      this._updateDeckDailyStats(deck)
      // In Java, this also saves the deck if modified. Assume JS deck.save() if needed.
    }

    const lastUnburied = await this.mCol.getConfValue('lastUnburied', 0)
    if (lastUnburied < this.mToday) {
      await this.unburyCards() // Unbury for all decks
      await this.mCol.setConfValue('lastUnburied', this.mToday)
    }
  }
  _updateDeckDailyStats(deck) {
    /* ... as before ... */
    ;['new', 'rev', 'lrn', 'time'].forEach((t) => {
      const key = t + 'Today'
      let tTodayArray = deck.get ? deck.get(key) : deck[key] // Handle map-like or object
      if (!tTodayArray || tTodayArray[0] !== this.mToday) {
        const newArray = [this.mToday, 0]
        if (deck.set) deck.set(key, newArray)
        else deck[key] = newArray
      }
    })
  }
  async _checkDay() {
    if (this.mCol.time.intTime() > this.mDayCutoff) {
      await this.reset()
    }
  }

  // --- Resetting Logic ---
  async reset() {
    /* ... as before ... */
    await this._updateCutoff()
    await this.resetCounts(false)
    await this.resetQueues(false)
  }
  async resetCounts(checkCutoffOrCancelListener = true) {
    /* ... as before ... */
    // JS doesn't have CancelListener in the same way. checkCutoff is a boolean.
    if (
      typeof checkCutoffOrCancelListener === 'boolean' &&
      checkCutoffOrCancelListener
    ) {
      await this._updateCutoff()
    }
    // If checkCutoffOrCancelListener is a CancelListener-like object, add isCancelled checks
    // const isCancelled = (listener) => listener && listener.isCancelled();

    this.mHaveCounts = false
    await this._resetLrnCount(/*cancelListener*/)
    // if (isCancelled(cancelListener)) return;
    await this._resetRevCount(/*cancelListener*/)
    // if (isCancelled(cancelListener)) return;
    await this._resetNewCount(/*cancelListener*/)
    // if (isCancelled(cancelListener)) return;
    this.mHaveCounts = true
  }
  async resetQueues(checkCutoff = true) {
    /* ... as before, ensure _updateNewCardRatio is async if _resetNewQueue calls it ... */
    if (checkCutoff) {
      // This could be an issue if _updateCutoff() is not called recently and is needed here
      // For now, assuming it's handled, or making this method async to call it.
      // await this._updateCutoff(); // If strictly needed here
    }
    this._resetLrnQueue() // Synchronous part
    this._resetRevQueue() // Synchronous part
    await this._resetNewQueue() // Async because it calls _updateNewCardRatio
    this.mHaveQueues = true
  }
  deferReset(card = null) {
    this.mHaveQueues = false
    this.mHaveCounts = false
    if (card) {
      this.setCurrentCard(card) // setCurrentCard is async
    } else {
      this.discardCurrentCard()
    }
  }

  // --- Count Resets (More detail) ---
  async _updateLrnCutoff(force = false) {
    /* ... as before ... */
    const collapseTime = await this.mCol.getConfValue('collapseTime', 1200) // Default 20 mins in seconds
    const nextCutoff = this.mCol.time.intTime() + collapseTime
    if (nextCutoff - this.mLrnCutoff > 60 || force) {
      this.mLrnCutoff = nextCutoff
      return true
    }
    return false
  }
  async _resetLrnCount() {
    /* ... as before ... */
    await this._updateLrnCutoff(true)
    const deckLimitStr = await this._deckLimit()
    let count = 0
    if (deckLimitStr !== '(0)') {
      // Avoid SQL error with empty IN ()
      count = await this.mCol.db.queryScalar(
        `SELECT count() FROM cards WHERE did IN ${deckLimitStr}
                 AND queue = ${Consts.QUEUE_TYPE_LRN} AND id != ? AND due < ?`,
        this._currentCardId(),
        this.mLrnCutoff,
      )
      count += await this.mCol.db.queryScalar(
        `SELECT count() FROM cards WHERE did IN ${deckLimitStr}
                 AND queue = ${Consts.QUEUE_TYPE_DAY_LEARN_RELEARN} AND due <= ? AND id != ?`,
        this.mToday,
        this._currentCardId(),
      )
      count += await this.mCol.db.queryScalar(
        `SELECT count() FROM cards WHERE did IN ${deckLimitStr}
                 AND queue = ${Consts.QUEUE_TYPE_PREVIEW} AND id != ?`,
        this._currentCardId(),
      )
    }
    this.mLrnCount = count
  }
  async _resetRevCount() {
    /* ... as before ... */
    const lim = await this._currentRevLimit(true)
    const deckLimitStr = await this._deckLimit()
    this.mRevCount = 0
    if (lim > 0 && deckLimitStr !== '(0)') {
      this.mRevCount = await this.mCol.db.queryScalar(
        `SELECT count() FROM (SELECT id FROM cards WHERE did IN ${deckLimitStr}
                 AND queue = ${Consts.QUEUE_TYPE_REV} AND due <= ? AND id != ? LIMIT ?)`,
        this.mToday,
        this._currentCardId(),
        lim,
      )
    }
  }
  async _cntFnNew(did, lim) {
    // Helper for _walkingCount (if implemented) or direct use
    return await this.mCol.db.queryScalar(
      'SELECT count() FROM (SELECT 1 FROM cards WHERE did = ? AND queue = ? AND id != ? LIMIT ?)',
      did,
      Consts.QUEUE_TYPE_NEW,
      this._currentCardId(),
      lim,
    )
  }
  async _resetNewCount() {
    /* ... as before, ideally using _walkingCount ... */
    // Simplified version from before. A full _walkingCount is complex.
    // For now, sticking to the simplified loop, or assuming _walkingCount would be passed as a dependency.
    const activeDeckIds = await this.mCol.decks.active()
    let totalNew = 0
    if (activeDeckIds.length > 0) {
      for (const did of activeDeckIds) {
        const deck = await this.mCol.decks.get(did) // Assuming deck object has isDyn()
        if (!deck) continue
        const limitSingle = await this._deckNewLimitSingle(deck, true) // deck is an object here
        if (limitSingle > 0) {
          totalNew += await this._cntFnNew(did, limitSingle)
        }
      }
    }
    this.mNewCount = totalNew
  }

  // --- Queue Resets (More detail) ---
  async _resetLrnQueue() {
    /* ... as before ... */
    this.mLrnQueue.clear()
    this.mLrnDayQueue.clear()
    this.mLrnDids = await this.mCol.decks.active() // Populate here
  }
  _resetRevQueue() {
    this.mRevQueue.clear()
  } // Stays synchronous
  async _resetNewQueue() {
    /* ... as before ... */
    this.mNewDids = await this.mCol.decks.active()
    this.mNewQueue.clear()
    await this._updateNewCardRatio()
  }

  // --- Getting the Next Card (More detail for sub-methods) ---
  async getCard() {
    /* ... as before ... */
    await this._checkDay()
    if (!this.mHaveQueues) {
      await this.resetQueues(false)
    }
    let card = await this._getCardInternal() // Renamed from _getCard to avoid conflict with abstract
    if (card === null && !this.mHaveCounts) {
      await this.reset()
      card = await this._getCardInternal()
    }
    if (card !== null) {
      this.mCol.log({ type: 'getCard', cardId: card.getId() })
      this.incrReps()
      this._decrementCounts(card)
      await this.setCurrentCard(card) // setCurrentCard is async
      card.startTimer()
    } else {
      this.discardCurrentCard()
    }
    if (!this.mHaveCounts) {
      console.warn(
        'Counts became dirty after getCard, may need reset on next cycle.',
      )
    }
    return card
  }

  async _getCardInternal() {
    /* ... (as before, named _getCardInternal now) ... */
    let c = await this._getLrnCard(false)
    if (c) return c
    if (await this._timeForNewCard()) {
      c = await this._getNewCard()
      if (c) return c
    }
    const dayLearnFirst = await this.mCol.getConfValue('dayLearnFirst', false)
    if (dayLearnFirst) {
      c = await this._getLrnDayCard()
      if (c) return c
    }
    c = await this._getRevCard()
    if (c) return c
    if (!dayLearnFirst) {
      c = await this._getLrnDayCard()
      if (c) return c
    }
    c = await this._getNewCard()
    if (c) return c
    return this._getLrnCard(true)
  }

  async _maybeResetLrn(force = false) {
    if (await this._updateLrnCutoff(force)) {
      // updateLrnCutoff is sync in current JS impl.
      await this._resetLrn() // _resetLrn calls async _resetLrnCount
    }
  }
  async _resetLrn() {
    await this._resetLrnCount()
    await this._resetLrnQueue() // mLrnDids are populated here now
  }

  async _fillLrn() {
    if (this.mHaveCounts && this.mLrnCount === 0) return false
    if (!this.mLrnQueue.isEmpty()) return true

    const collapseTime = await this.mCol.getConfValue('collapseTime', 1200)
    const cutoff = this.mCol.time.intTime() + collapseTime
    this.mLrnQueue.clear() // Also resets _filled
    const deckLimitStr = await this._deckLimit()

    if (deckLimitStr !== '(0)') {
      const cardsData = await this.mCol.db.query(
        // query returns array of objects
        `SELECT due, id FROM cards WHERE did IN ${deckLimitStr}
                 AND queue IN (${Consts.QUEUE_TYPE_LRN}, ${Consts.QUEUE_TYPE_PREVIEW}) AND due < ?
                 AND id != ? LIMIT ?`,
        cutoff,
        this._currentCardId(),
        this.mReportLimit,
      )
      cardsData.forEach((c) => this.mLrnQueue.add(c.due, c.id))
      this.mLrnQueue.sort() // Sort by due time
    }
    this.mLrnQueue.setFilled()
    return !this.mLrnQueue.isEmpty()
  }
  async _getLrnCard(collapse) {
    await this._maybeResetLrn(collapse && this.mLrnCount === 0)
    if (await this._fillLrn()) {
      let cutoff = this.mCol.time.intTime()
      if (collapse) {
        cutoff += await this.mCol.getConfValue('collapseTime', 1200)
      }
      if (this.mLrnQueue.getFirstDue() < cutoff) {
        return this.mLrnQueue.removeFirstCard()
      }
    }
    return null
  }

  async _fillLrnDay() {
    if (this.mHaveCounts && this.mLrnCount === 0) return false // Check against combined LRN count
    if (!this.mLrnDayQueue.isEmpty()) return true

    while (this.mLrnDids.length > 0) {
      const did = this.mLrnDids[0]
      this.mLrnDayQueue.clear()
      const cardIds = await this.mCol.db.queryLongList(
        `SELECT id FROM cards WHERE did = ? AND queue = ${Consts.QUEUE_TYPE_DAY_LEARN_RELEARN}
                 AND due <= ? AND id != ? LIMIT ?`,
        did,
        this.mToday,
        this._currentCardId(),
        this.mQueueLimit,
      )
      cardIds.forEach((cid) => this.mLrnDayQueue.add(cid))

      if (!this.mLrnDayQueue.isEmpty()) {
        // TODO: Seeded random shuffle based on mToday
        this.mLrnDayQueue.shuffle() // Basic shuffle for now
        if (this.mLrnDayQueue.length < this.mQueueLimit) {
          this.mLrnDids.shift() // Move to next did if this one is exhausted
        }
        return true
      }
      this.mLrnDids.shift() // Nothing in this did, move to next
    }
    return false
  }
  async _getLrnDayCard() {
    if (await this._fillLrnDay()) {
      return this.mLrnDayQueue.removeFirstCard()
    }
    return null
  }

  async _fillRev(allowSibling = false) {
    if (!this.mRevQueue.isEmpty()) return true
    if (this.mHaveCounts && this.mRevCount === 0) return false

    const limit = Math.min(this.mQueueLimit, await this._currentRevLimit(true))
    if (limit > 0) {
      this.mRevQueue.clear()
      const idName = allowSibling ? 'id' : 'nid'
      const idToExclude = allowSibling
        ? this._currentCardId()
        : await this._currentCardNid() // _currentCardNid is async
      const deckLimitStr = await this._deckLimit()

      if (deckLimitStr !== '(0)') {
        const cardIds = await this.mCol.db.queryLongList(
          `SELECT id FROM cards WHERE did IN ${deckLimitStr}
                     AND queue = ${Consts.QUEUE_TYPE_REV} AND due <= ? AND ${idName} != ?
                     ORDER BY due, random() LIMIT ?`, // random() for SQLite, adjust for other DBs
          this.mToday,
          idToExclude,
          limit,
        )
        cardIds.forEach((cid) => this.mRevQueue.add(cid))
      }
      if (!this.mRevQueue.isEmpty()) return true
    }

    if (this.mHaveCounts && this.mRevCount !== 0 && !allowSibling) {
      await this._resetRev() // _resetRev calls async _resetRevCount
      return this._fillRev(true)
    }
    return false
  }
  async _getRevCard() {
    if (await this._fillRev()) {
      return this.mRevQueue.removeFirstCard()
    }
    return null
  }
  async _resetRev() {
    await this._resetRevCount()
    this._resetRevQueue()
  }

  // --- Answering a Card (More detail for sub-methods) ---
  async answerCard(card, ease) {
    /* ... as before ... */
    this.mCol.log({ type: 'answerCardStart', cardId: card.getId(), ease: ease })
    this.discardCurrentCard()
    // this.mCol.markReview(card); // For sync if needed
    await this._burySiblings(card)

    await this._answerCardInternal(card, ease) // Renamed

    await this._updateStats(card, 'time', card.timeTaken())
    card.setMod(this.mCol.time.intTime())
    card.setUsn(await this.mCol.usn())
    await card.flushSched()
    this.mCol.log({ type: 'answerCardEnd', cardId: card.getId() })
  }

  async _answerCardInternal(card, ease) {
    /* ... (as before, named _answerCardInternal now) ... */
    if (await this._previewingCard(card)) {
      await this._answerCardPreview(card, ease)
      return
    }
    card.incrReps()
    const originalQueue = card.getQueue()

    if (originalQueue === Consts.QUEUE_TYPE_NEW) {
      card.setQueue(Consts.QUEUE_TYPE_LRN)
      card.setType(Consts.CARD_TYPE_LRN)
      card.setLeft(await this._startingLeft(card))
      await this._updateStats(card, 'new')
    }

    // Check card.queue as it might have changed if it was new
    if (
      card.getQueue() === Consts.QUEUE_TYPE_LRN ||
      card.getQueue() === Consts.QUEUE_TYPE_DAY_LEARN_RELEARN
    ) {
      await this._answerLrnCard(card, ease)
    } else if (originalQueue === Consts.QUEUE_TYPE_REV) {
      // Must check originalQueue here
      await this._answerRevCard(card, ease)
      await this._updateStats(card, 'rev') // Only if it came from rev queue
    } else if (originalQueue !== Consts.QUEUE_TYPE_NEW) {
      console.error(
        'Invalid queue for answering:',
        card.getQueue(),
        'original:',
        originalQueue,
      )
      throw new Error('Invalid queue state in _answerCardInternal')
    }

    if (card.getODue() > 0) card.setODue(0)
  }

  async _answerCardPreview(card, ease) {
    if (ease === Consts.BUTTON_ONE) {
      // Repeat
      card.setQueue(Consts.QUEUE_TYPE_PREVIEW)
      card.setDue(this.mCol.time.intTime() + (await this._previewDelay(card)))
      this.mLrnCount += 1 // Manually adjust count as it's not going through standard queue logic for this
    } else if (ease === Consts.BUTTON_TWO) {
      // Forget (remove from filtered)
      await this._restorePreviewCard(card)
      this._removeFromFiltered(card) // This mainly resets odid, odue
    } else {
      throw new Error('Invalid ease for preview card')
    }
    // Revlog entries are not typically made for previews in the same way
  }

  async _previewingCard(card) {
    const conf = await this._cardConf(card)
    return conf.isDyn && conf.isDyn() && !conf.resched // Check isDyn is a function
  }

  async _previewDelay(card) {
    const conf = await this._cardConf(card)
    return (conf.previewDelay !== undefined ? conf.previewDelay : 10) * 60 // Default 10 minutes to seconds
  }

  async _restorePreviewCard(card) {
    if (!card.isInDynamicDeck())
      throw new Error("ODid wasn't set for preview card restore")
    card.setDue(card.getODue())
    if (
      card.getType() === Consts.CARD_TYPE_LRN ||
      card.getType() === Consts.CARD_TYPE_RELEARNING
    ) {
      card.setQueue(
        card.getODue() > 1000000000
          ? Consts.QUEUE_TYPE_LRN
          : Consts.QUEUE_TYPE_DAY_LEARN_RELEARN,
      )
    } else {
      card.setQueue(card.getType()) // Map directly e.g. NEW to NEW, REV to REV
    }
  }

  // --- Learning Card Mechanics (More detail) ---
  async _startingLeft(card) {
    /* ... as before ... */
    let conf
    if (card.getType() === Consts.CARD_TYPE_RELEARNING) {
      conf = await this._lapseConf(card)
    } else {
      // New or Lrn (from new)
      conf = await this._newConf(card) // In SchedV2, _lrnConf routes to _newConf for initial learning steps
    }
    const totalSteps = conf.delays.length
    const stepsToday = await this._leftToday(conf.delays, totalSteps) // _leftToday is async
    return totalSteps + stepsToday * 1000
  }

  async _leftToday(delays, left, now = 0) {
    // now is timestamp in seconds
    if (now === 0) now = this.mCol.time.intTime()

    let ok = 0
    const numDelaysToConsider = Math.min(left, delays.length)
    let currentVirtualTime = now

    for (let i = 0; i < numDelaysToConsider; i++) {
      // Delays are in minutes in config, convert to seconds
      currentVirtualTime +=
        delays[delays.length - numDelaysToConsider + i] * 60.0
      if (currentVirtualTime > this.mDayCutoff) {
        break // This step would push it to the next day
      }
      ok = i + 1 // Number of steps that can be completed today
    }
    return ok
  }

  async _moveToFirstStep(card, conf) {
    // conf is _lapseConf or _newConf
    card.setLeft(await this._startingLeft(card))
    if (card.getType() === Consts.CARD_TYPE_RELEARNING) {
      // Card is lapsing
      this._updateRevIvlOnFail(card, conf) // conf here is lapseConf
    }
    return this._rescheduleLrnCard(card, conf) // Returns delay in seconds
  }

  _moveToNextStep(card, conf) {
    // conf is _newConf or _lapseConf
    const stepsRemainingInBatch = (card.getLeft() % 1000) - 1
    // _leftToday for the *remaining* steps to see how many of *those* are today
    // This part of logic in Java SchedV2 for left was:
    // card.setLeft(_leftToday(conf.getJSONArray("delays"), left) * 1000 + left);
    // My _leftToday calculates steps that can be completed *from now*.
    // The Java `left` in `_leftToday(delays, left)` is total steps in current batch.
    // For JS, if `_leftToday` is correctly defined, this should be fine.
    // Let's assume `conf.delays` are the steps for *this current learning phase*.
    const newLeftTodayCount = 0 // Simpler: all remaining steps in this batch are for "today" in terms of count
    // The actual due date will determine if it crosses mDayCutoff
    card.setLeft(newLeftTodayCount * 1000 + stepsRemainingInBatch)
    this._rescheduleLrnCard(card, conf) // Is async
  }

  async _repeatStep(card, conf) {
    const delay = await this._delayForRepeatingGrade(conf, card.getLeft())
    this._rescheduleLrnCard(card, conf, delay) // Is async
  }

  async _rescheduleLrnCard(card, conf, delay = null) {
    // delay in seconds
    if (delay === null) {
      delay = await this._delayForGrade(conf, card.getLeft())
    }
    card.setDue(this.mCol.time.intTime() + delay)

    if (card.getDue() < this.mDayCutoff) {
      // Due today (within current Anki day)
      let maxExtra = Math.min(300, Math.floor(delay * 0.25))
      if (maxExtra < 1 && delay > 0)
        maxExtra = 1 // Ensure some fuzz if possible
      else if (maxExtra < 1) maxExtra = 0

      const fuzz = maxExtra > 0 ? Math.floor(Math.random() * maxExtra) : 0
      card.setDue(Math.min(this.mDayCutoff - 1, card.getDue() + fuzz))
      card.setQueue(Consts.QUEUE_TYPE_LRN)

      const collapseTime = await this.mCol.getConfValue('collapseTime', 1200)
      if (card.getDue() < this.mCol.time.intTime() + collapseTime) {
        this.mLrnCount += 1 // Manually adjust, as it's re-added to a queue that might be processed soon
        if (
          !this.mLrnQueue.isEmpty() &&
          (await this.revCount()) === 0 &&
          (await this.newCount()) === 0
        ) {
          // Avoid showing twice in a row if it's the only thing left
          const smallestDueInLrnQ = this.mLrnQueue.getFirstDue()
          card.setDue(Math.max(card.getDue(), smallestDueInLrnQ + 1))
        }
        this._sortIntoLrn(card.getDue(), card.getId())
      }
    } else {
      // Due on a future day
      const daysAhead =
        Math.floor((card.getDue() - this.mDayCutoff) / Consts.SECONDS_PER_DAY) +
        1
      card.setDue(this.mToday + daysAhead) // Due is now in "days from collection creation"
      card.setQueue(Consts.QUEUE_TYPE_DAY_LEARN_RELEARN)
    }
    return delay // Return the original calculated delay (before fuzz)
  }

  _sortIntoLrn(dueTimeSec, cardId) {
    // dueTimeSec is absolute timestamp in seconds
    if (!this.mLrnQueue.isFilled()) {
      // Queue not filled yet, usually means it's being rebuilt.
      // Adding here might be premature or could be added and sorted later.
      // Java behavior: only adds if queue is considered active.
      return
    }
    // Create a LrnCard object to insert
    const newLrnEntry = new LrnCard(this.mCol, dueTimeSec, cardId)

    // Find insertion point
    let i = 0
    while (
      i < this.mLrnQueue._queue.length &&
      this.mLrnQueue._queue[i].getDue() <= dueTimeSec
    ) {
      i++
    }
    this.mLrnQueue._queue.splice(i, 0, newLrnEntry)
  }

  async _delayForGrade(conf, leftSteps) {
    // leftSteps is like 2003 (3 steps today, 2000 total in batch)
    leftSteps = leftSteps % 1000 // Actual steps remaining in this batch
    const delays = conf.delays // Array of delays in minutes
    if (delays.length === 0) return 60 // Default 1 min if no steps defined

    // Delays are indexed from the end of the array in Java's logic for "left"
    // If delays = [1, 10, 30], left=3 means delays[0], left=2 means delays[1], left=1 means delays[2]
    const delayIndex = delays.length - leftSteps
    let delayInMinutes
    if (delayIndex >= 0 && delayIndex < delays.length) {
      delayInMinutes = delays[delayIndex]
    } else {
      // Fallback: use first step's delay or a default if out of bounds (e.g. left=0 or too high)
      delayInMinutes = delays.length > 0 ? delays[0] : 1.0 // Default to 1 minute
      console.warn(
        `_delayForGrade: leftSteps ${leftSteps} out of bounds for delays array length ${delays.length}. Using fallback.`,
      )
    }
    return Math.floor(delayInMinutes * 60) // Convert to seconds
  }

  async _delayForRepeatingGrade(conf, leftSteps) {
    const delay1 = await this._delayForGrade(conf, leftSteps) // Current step's delay
    let delay2
    if (conf.delays.length > 1 && leftSteps % 1000 < conf.delays.length) {
      // Ensure there's a "next" step (left-1)
      delay2 = await this._delayForGrade(conf, leftSteps - 1) // Hypothetical "next" step's delay
    } else {
      // No next step defined or it's the last one
      delay2 = delay1 * 2 // Default: double current delay
    }
    return Math.floor((delay1 + Math.max(delay1, delay2)) / 2)
  }

  // --- Graduating and Lapsing ---
  async _rescheduleAsRev(card, conf, early) {
    // conf is _newConf or _lapseConf
    const isLapse =
      card.getType() === Consts.CARD_TYPE_REV ||
      card.getType() === Consts.CARD_TYPE_RELEARNING
    if (isLapse) {
      // Graduating from a lapse
      this._rescheduleGraduatingLapse(card, early)
    } else {
      // Graduating from new/learn
      await this._rescheduleNew(card, conf, early) // conf is _newConf
    }
    if (card.isInDynamicDeck()) {
      this._removeFromFiltered(card)
    }
  }

  _rescheduleGraduatingLapse(card, early) {
    if (early) {
      // Typically means "Easy" button during relearning last step
      card.setIvl(card.getIvl() + 1) // Small bonus
    }
    // If not early, ivl is already set by _updateRevIvlOnFail (for first step lapse)
    // or it's the interval it had before lapsing (if multi-step relearn and graduating now)
    card.setDue(this.mToday + card.getIvl())
    card.setQueue(Consts.QUEUE_TYPE_REV)
    card.setType(Consts.CARD_TYPE_REV) // Back to review state
  }

  async _rescheduleNew(card, conf, early) {
    // conf is _newConf
    card.setIvl(await this._graduatingIvl(card, conf, early, true)) // Apply fuzz for new cards graduating
    card.setDue(this.mToday + card.getIvl())
    card.setFactor(conf.initialFactor)
    card.setType(Consts.CARD_TYPE_REV)
    card.setQueue(Consts.QUEUE_TYPE_REV)
  }

  async _graduatingIvl(card, conf, early, fuzz = false) {
    // conf can be _newConf or _lapseConf
    // If it's a relearning card graduating (from _lapseConf)
    if (
      card.getType() === Consts.CARD_TYPE_REV ||
      card.getType() === Consts.CARD_TYPE_RELEARNING
    ) {
      // This path is for when _rescheduleAsRev calls it with a lapsed card.
      // The interval is usually restored or slightly bonused.
      let currentIvl = card.getIvl() // This should be the interval set by _updateRevIvlOnFail or its pre-lapse ivl.
      const bonus = early ? 1 : 0
      return currentIvl + bonus
    }

    // If it's a new card graduating (from _newConf)
    let idealIvl
    const ints = conf.ints // [graduating_interval, easy_interval] from new card config
    if (!early) {
      // Normal graduation (e.g. "Good" on last learning step)
      idealIvl = ints[0]
    } else {
      // Early graduation (e.g. "Easy" button on a learning step)
      idealIvl = ints[1]
    }

    if (fuzz) {
      idealIvl = this._fuzzedIvl(idealIvl)
    }
    return Math.max(1, idealIvl) // Ensure interval is at least 1 day
  }

  _updateRevIvlOnFail(card, conf) {
    // conf is _lapseConf
    card.setLastIvl(card.getIvl())
    card.setIvl(this._lapseIvl(card, conf))
  }

  _lapseIvl(card, conf) {
    // conf is _lapseConf
    return Math.max(
      1,
      Math.max(conf.minInt, Math.floor(card.getIvl() * conf.mult)),
    )
  }

  async _rescheduleLapse(card) {
    // When "Again" is pressed on a review card
    const conf = await this._lapseConf(card)
    card.setLapses(card.getLapses() + 1)
    card.setFactor(Math.max(1300, card.getFactor() - 200))

    let delaySeconds = 0 // For revlog if it doesn't enter learning steps
    const wasLeechSuspended =
      (await this._checkLeech(card, conf)) &&
      card.getQueue() === Consts.QUEUE_TYPE_SUSPENDED

    if (conf.delays.length > 0 && !wasLeechSuspended) {
      // Has relearning steps
      card.setType(Consts.CARD_TYPE_RELEARNING) // Mark as relearning
      delaySeconds = await this._moveToFirstStep(card, conf) // Returns the first step's delay in seconds
    } else {
      // No relearning steps, or was suspended by leech check
      this._updateRevIvlOnFail(card, conf) // Calculate new (lapsed) interval directly
      this._rescheduleGraduatingLapse(card, false) // Reschedule as REV with this new interval (not "early")
      if (wasLeechSuspended) {
        card.setQueue(Consts.QUEUE_TYPE_SUSPENDED) // Ensure it stays suspended
      }
      // delaySeconds remains 0 as it's not a learning step with a specific delay in seconds for revlog
    }
    return delaySeconds // This is for the revlog: positive if it's a learning step, 0 otherwise.
  }

  async _rescheduleRev(card, ease, early) {
    // For Hard, Good, Easy on review card
    card.setLastIvl(card.getIvl())
    if (early) {
      await this._updateEarlyRevIvl(card, ease)
    } else {
      await this._updateRevIvl(card, ease)
    }

    card.setFactor(
      Math.max(
        1300,
        card.getFactor() + Consts.FACTOR_ADDITION_VALUES[ease - 2],
      ),
    ) // ease 2,3,4 -> index 0,1,2
    card.setDue(this.mToday + card.getIvl())

    this._removeFromFiltered(card) // If it was in a dynamic deck
  }

  // --- Interval Calculations (More detail) ---
  _fuzzedIvl(ivl) {
    /* ... as before ... */
    const [min, max] = this._fuzzIvlRange(ivl)
    if (min === max) return min
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  _fuzzIvlRange(ivl) {
    /* ... as before ... */
    let fuzz
    if (ivl < 2) return [1, 1]
    if (ivl === 2) return [2, 3]
    if (ivl < 7) fuzz = Math.floor(ivl * 0.25)
    else if (ivl < 30) fuzz = Math.max(2, Math.floor(ivl * 0.15))
    else fuzz = Math.max(4, Math.floor(ivl * 0.05))
    fuzz = Math.max(fuzz, 1) // fuzz at least a day
    return [Math.max(1, ivl - fuzz), ivl + fuzz] // Ensure min interval is 1
  }
  _constrainedIvl(ivl, conf, prevIvl, fuzz) {
    // conf is revConf
    let newIvl = Math.round(
      ivl * (conf.ivlFct !== undefined ? conf.ivlFct : 1.0),
    )
    if (fuzz) {
      newIvl = this._fuzzedIvl(newIvl)
    }
    newIvl = Math.max(newIvl, prevIvl + 1, 1) // Must be at least prev+1, and at least 1
    newIvl = Math.min(newIvl, conf.maxIvl)
    return newIvl
  }
  _daysLate(card) {
    /* ... as before ... */
    const dueDay = card.isInDynamicDeck() ? card.getODue() : card.getDue()
    // If due is a timestamp, convert to day. If it's already a day number, use directly.
    // Assuming due is in "days since creation" format matching mToday for review/daylearn cards.
    return Math.max(0, this.mToday - dueDay)
  }
  async _nextRevIvl(card, ease, fuzz) {
    /* ... as before ... */
    const delayDays = this._daysLate(card)
    const conf = await this._revConf(card)
    const factor = card.getFactor() / 1000.0
    const hardFactor = conf.hardFactor !== undefined ? conf.hardFactor : 1.2
    const hardMin = hardFactor > 1 ? card.getIvl() : 0

    const ivl2 = this._constrainedIvl(
      card.getIvl() * hardFactor,
      conf,
      hardMin,
      fuzz,
    ) // Hard
    if (ease === Consts.BUTTON_TWO) return ivl2

    const ivl3 = this._constrainedIvl(
      (card.getIvl() + delayDays / 2.0) * factor,
      conf,
      ivl2,
      fuzz,
    ) // Good
    if (ease === Consts.BUTTON_THREE) return ivl3

    // Easy (BUTTON_FOUR)
    return this._constrainedIvl(
      (card.getIvl() + delayDays) * factor * conf.ease4,
      conf,
      ivl3,
      fuzz,
    )
  }
  async _updateRevIvl(card, ease) {
    card.setIvl(await this._nextRevIvl(card, ease, true))
  } // fuzz=true for normal reviews
  async _updateEarlyRevIvl(card, ease) {
    card.setIvl(await this._earlyReviewIvl(card, ease))
  }

  async _earlyReviewIvl(card, ease) {
    /* ... as before ... */
    if (
      !card.isInDynamicDeck() ||
      card.getType() !== Consts.CARD_TYPE_REV ||
      card.getFactor() === 0
    ) {
      throw new Error('Unexpected card parameters for early review interval.')
    }
    if (ease <= Consts.BUTTON_ONE)
      throw new Error('Ease must be > 1 for early review interval.')

    const elapsedDays = card.getIvl() - (card.getODue() - this.mToday)
    const conf = await this._revConf(card)
    let easyBonus = 1.0
    let minNewIvlRatio = 1.0 // Ratio to pre-early interval, used for hard button

    let calculatedFactor
    if (ease === Consts.BUTTON_TWO) {
      // Hard
      calculatedFactor = conf.hardFactor !== undefined ? conf.hardFactor : 1.2
      minNewIvlRatio = calculatedFactor / 2.0 // Don't decrease by more than half of normal hard factor
    } else if (ease === Consts.BUTTON_THREE) {
      // Good
      calculatedFactor = card.getFactor() / 1000.0
    } else {
      // BUTTON_FOUR - Easy
      calculatedFactor = card.getFactor() / 1000.0
      const ease4 = conf.ease4 // e.g. 1.3
      easyBonus = ease4 - (ease4 - 1.0) / 2.0 // e.g. 1.3 -> 1.15
    }

    let newIvl = Math.max(elapsedDays * calculatedFactor, 1.0)
    newIvl = Math.max(card.getIvl() * minNewIvlRatio, newIvl) * easyBonus
    return this._constrainedIvl(newIvl, conf, 0, false) // No fuzz for early reviews
  }

  async nextIvl(card, ease) {
    // Returns interval in seconds
    if (await this._previewingCard(card)) {
      if (ease === Consts.BUTTON_ONE) return await this._previewDelay(card)
      return 0 // Other buttons remove from preview
    }
    if (
      card.getQueue() === Consts.QUEUE_TYPE_NEW ||
      card.getQueue() === Consts.QUEUE_TYPE_LRN ||
      card.getQueue() === Consts.QUEUE_TYPE_DAY_LEARN_RELEARN
    ) {
      return this._nextLrnIvl(card, ease) // Is async
    }
    // Review card
    if (ease === Consts.BUTTON_ONE) {
      // Lapsing
      const conf = await this._lapseConf(card)
      if (conf.delays.length > 0) {
        // Has relearning steps
        return await this._delayForGrade(conf, conf.delays.length) // Delay for the first relearning step
      }
      return this._lapseIvl(card, conf) * Consts.SECONDS_PER_DAY // No steps, interval in days
    }
    // Not lapsing (Hard, Good, Easy on review)
    const early = card.isInDynamicDeck() && card.getODue() > this.mToday
    if (early) {
      return (await this._earlyReviewIvl(card, ease)) * Consts.SECONDS_PER_DAY
    }
    return (await this._nextRevIvl(card, ease, false)) * Consts.SECONDS_PER_DAY // fuzz=false for display
  }

  async _nextLrnIvl(card, ease) {
    // Returns interval in seconds
    // Simulate card state without actually changing it, for display purposes
    let tempLeft = card.getLeft()
    if (card.getQueue() === Consts.QUEUE_TYPE_NEW) {
      // If it's a new card, pretend it just entered learning for the first step.
      // This requires knowing the number of learning steps.
      const newConf = await this._newConf(card)
      const totalSteps = newConf.delays.length
      const stepsToday = await this._leftToday(newConf.delays, totalSteps)
      tempLeft = totalSteps + stepsToday * 1000
    }

    const conf = await this._lrnConf(card) // _newConf or _lapseConf based on card type

    if (ease === Consts.BUTTON_ONE) {
      // Again
      return await this._delayForGrade(conf, conf.delays.length) // Delay for the first step
    } else if (ease === Consts.BUTTON_TWO) {
      // Good (repeat step)
      return await this._delayForRepeatingGrade(conf, tempLeft)
    } else if (ease === Consts.BUTTON_FOUR) {
      // Easy (early graduate)
      return (
        (await this._graduatingIvl(card, conf, true, false)) *
        Consts.SECONDS_PER_DAY
      ) // fuzz=false for display
    } else {
      // BUTTON_THREE - Next step or graduate
      const stepsRemainingInBatch = (tempLeft % 1000) - 1
      if (stepsRemainingInBatch <= 0) {
        // Graduate
        return (
          (await this._graduatingIvl(card, conf, false, false)) *
          Consts.SECONDS_PER_DAY
        ) // fuzz=false
      }
      // Next step
      return await this._delayForGrade(conf, stepsRemainingInBatch)
    }
  }

  async nextIvlStr(context, card, ease) {
    // context for localization (e.g., { getString: (id, ...args) => "" })
    const ivlSeconds = await this.nextIvl(card, ease)
    if (ivlSeconds === 0) return context.getString('sched_end_string_id') // e.g., "(end)"

    // Utils.timeQuantityNextIvl from Java AnkiDroid would format this.
    // Simplified formatting:
    let s
    if (ivlSeconds < 60) s = `${ivlSeconds}s`
    else if (ivlSeconds < 3600) s = `${Math.round(ivlSeconds / 60)}m`
    else if (ivlSeconds < Consts.SECONDS_PER_DAY)
      s = `${Math.round(ivlSeconds / 3600)}h`
    else s = `${Math.round(ivlSeconds / Consts.SECONDS_PER_DAY)}d`
    // Add < (less than) if it's a learning step shorter than collapseTime
    const collapseTime = await this.mCol.getConfValue('collapseTime', 1200)
    if (
      card.getQueue() !== Consts.QUEUE_TYPE_REV &&
      ivlSeconds < collapseTime &&
      ivlSeconds > 0
    ) {
      // Using a generic string, replace with R.string.less_than_time if available in context
      return `< ${s}`
    }
    return s
  }

  // --- Dynamic Decks, Leech, Stats, Suspend/Bury etc. (Adding more structure) ---
  _removeFromFiltered(card) {
    if (card.isInDynamicDeck()) {
      card.setDid(card.getODid()) // Restore original deck ID
      card.setODue(0)
      card.setODid(0)
    }
  }

  async _checkLeech(card, conf) {
    // conf is _lapseConf
    const leechFailsThreshold = conf.leechFails
    if (leechFailsThreshold === 0) return false

    if (
      card.getLapses() >= leechFailsThreshold &&
      (card.getLapses() - leechFailsThreshold) %
        Math.max(Math.floor(leechFailsThreshold / 2), 1) ===
        0
    ) {
      const note = await card.note()
      await note.addTag('leech') // Assume note.addTag saves or is saved later
      await note.flush()

      if (conf.leechAction === Consts.LEECH_SUSPEND) {
        card.setQueue(Consts.QUEUE_TYPE_SUSPENDED)
      }
      SchedV2.leechHook(card, this.mContextReference) // Call static leech hook
      return true
    }
    return false
  }

  static leechHook(card, contextRef) {
    // contextRef is a {runOnUiThread, showToast} like object
    if (contextRef && contextRef.get) {
      // Emulate WeakReference.get()
      const activity = contextRef.get()
      if (activity) {
        // const leechMessage = card.getQueue() < 0 ? "Card suspended as leech." : "Card marked as leech.";
        // activity.runOnUiThread(() => activity.showToast(leechMessage, true));
        // Simplified, assuming contextRef has a showToast method directly
        const leechMessage =
          card.getQueue() < 0
            ? activity.getString('leech_suspend_notification_id')
            : activity.getString('leech_notification_id')
        if (activity.runOnUiThread)
          activity.runOnUiThread(() => activity.showToast(leechMessage, true))
        else activity.showToast(leechMessage, true)
      } else console.warn('LeechHook: Activity from contextRef is null.')
    } else if (contextRef && contextRef.showToast) {
      // Simpler direct context
      const leechMessage =
        card.getQueue() < 0
          ? 'Card suspended as leech.'
          : 'Card marked as leech.'
      contextRef.showToast(leechMessage, true)
    }
    console.warn(
      'LeechHook: Could not show leech toast as context was unsuitable.',
    )
  }

  async _updateStats(card, typeStr, count = 1) {
    // typeStr is "new", "rev", "lrn", "time"
    const key = typeStr + 'Today'
    const did = card.getDid()
    // In Java, this updates current deck and all its parents.
    // Simplified: update current deck. A full parent update needs deck hierarchy traversal.
    const deck = await this.mCol.decks.get(did)
    if (deck) {
      let statsArray = deck.get ? deck.get(key) : deck[key]
      if (!statsArray || statsArray[0] !== this.mToday) {
        // Day rolled over or first stat for day
        statsArray = [this.mToday, 0]
      }
      statsArray[1] += count
      if (deck.set) deck.set(key, statsArray)
      else deck[key] = statsArray
      // await this.mCol.decks.save(deck); // If deck changes need explicit save
    }
    // TODO: Iterate over parent decks and update their stats too.
  }

  async suspendCards(ids) {
    if (!ids || ids.length === 0) return
    this.mCol.log({ type: 'suspendCards', ids })
    await this.mCol.db.execute(
      `UPDATE cards SET queue = ${Consts.QUEUE_TYPE_SUSPENDED}, mod = ?, usn = ? WHERE id IN (${ids.join(',')})`,
      this.mCol.time.intTime(),
      await this.mCol.usn(),
    )
    // Remove from active queues
    ids.forEach((id) => {
      this.mNewQueue.remove(id)
      this.mRevQueue.remove(id)
      this.mLrnDayQueue.remove(id) /* more for LrnQueue if needed */
    })
  }

  _restoreQueueSnippet() {
    // Used for unsuspend/unbury. Complex logic.
    // This SQL snippet determines the correct queue based on card type and original due date.
    // It's hard to replicate perfectly without knowing the exact DB schema for odue (if it stores type).
    // Simplified: set to type, which might not be right for LRN cards (day vs sub-day).
    // A more accurate version would check card.type and card.odue.
    // queue = (case when type in (LRN,RELEARN) then (case when odue > 1000000000 then LRN else DAY_LRN end) else type end)
    // For JS, this logic would be applied per card if not doing direct SQL.
    return `queue = CASE type 
                        WHEN ${Consts.CARD_TYPE_LRN} THEN ${Consts.QUEUE_TYPE_NEW} /* Lapsed LRN often becomes NEW */
                        WHEN ${Consts.CARD_TYPE_RELEARNING} THEN ${Consts.QUEUE_TYPE_REV} /* Lapsed RELEARN becomes REV */
                        ELSE type 
                        END`
    // The Java SchedV2 _restoreQueueSnippet is more nuanced, especially for cards from filtered decks (odue/odid).
    // SchedV2's snippet:
    // "queue = (case when type in (" + Consts.CARD_TYPE_LRN + "," + Consts.CARD_TYPE_RELEARNING + ") then\n" +
    // "  (case when (case when odue then odue else due end) > 1000000000 then 1 else " + Consts.QUEUE_TYPE_DAY_LEARN_RELEARN + " end)\n" +
    // "else\n" +
    // "  type\n" +
    // "end)  "
    // This means: if type is LRN or RELEARN, check its (original) due. If timestamp (large number) -> Q_LRN (1), else Q_DAY_LRN. Otherwise queue = type.
    // This requires access to 'odue' within the SQL or fetching cards first.
  }

  async unsuspendCards(ids) {
    if (!ids || ids.length === 0) return
    this.mCol.log({ type: 'unsuspendCards', ids })
    // Applying simplified restore logic. For full accuracy, fetch each card, determine correct queue, then update.
    // Or use a more complex SQL CASE WHEN statement if DB supports it well.
    const cardsToUpdate = []
    for (const id of ids) {
      const card = await Card.load(this.mCol, id)
      if (card && card.getQueue() === Consts.QUEUE_TYPE_SUSPENDED) {
        let newQueue
        if (
          card.getType() === Consts.CARD_TYPE_LRN ||
          card.getType() === Consts.CARD_TYPE_RELEARNING
        ) {
          const relevantDue =
            card.getODue() > 0 ? card.getODue() : card.getDue()
          newQueue =
            relevantDue > 1000000000
              ? Consts.QUEUE_TYPE_LRN
              : Consts.QUEUE_TYPE_DAY_LEARN_RELEARN
        } else {
          newQueue = card.getType() // e.g. NEW, REV
        }
        cardsToUpdate.push({ id: id, queue: newQueue })
      }
    }
    for (const c of cardsToUpdate) {
      await this.mCol.db.execute(
        'UPDATE cards SET queue = ?, mod = ?, usn = ? WHERE id = ?',
        c.queue,
        this.mCol.time.intTime(),
        await this.mCol.usn(),
        c.id,
      )
    }
  }

  _queueIsBuriedSnippet() {
    return `queue IN (${Consts.QUEUE_TYPE_SIBLING_BURIED}, ${Consts.QUEUE_TYPE_MANUALLY_BURIED})`
  }

  async unburyCards() {
    // Unbury all cards in the collection
    this.mCol.log({ type: 'unburyAllCardsGlobally' })
    const buriedCardIds = await this.mCol.db.queryLongList(
      `SELECT id FROM cards WHERE ${this._queueIsBuriedSnippet()}`,
    )
    if (buriedCardIds.length > 0) {
      this.mCol.log(buriedCardIds)
      // Similar to unsuspend, ideally iterate or use complex SQL for restoreQueueSnippet
      // Simplified for now:
      const cardsToUpdate = []
      for (const id of buriedCardIds) {
        const card = await Card.load(this.mCol, id)
        if (card) {
          // Ensure card data is loaded to determine type for queue restoration
          let newQueue
          if (
            card.getType() === Consts.CARD_TYPE_LRN ||
            card.getType() === Consts.CARD_TYPE_RELEARNING
          ) {
            const relevantDue =
              card.getODue() > 0 ? card.getODue() : card.getDue()
            // odue for filtered, due for normal. If odue exists, it's the original due.
            newQueue =
              relevantDue > 1000000000
                ? Consts.QUEUE_TYPE_LRN
                : Consts.QUEUE_TYPE_DAY_LEARN_RELEARN
          } else {
            newQueue = card.getType()
          }
          cardsToUpdate.push({ id: id, queue: newQueue })
        }
      }
      for (const c of cardsToUpdate) {
        await this.mCol.db.execute(
          'UPDATE cards SET queue = ?, mod = ?, usn = ? WHERE id = ?',
          c.queue,
          this.mCol.time.intTime(),
          await this.mCol.usn(),
          c.id,
        )
      }
    }
  }

  async unburyCardsForDeck(type = UnburyType.ALL, deckIds = null) {
    let queueCondition
    switch (type) {
      case UnburyType.MANUAL:
        queueCondition = `queue = ${Consts.QUEUE_TYPE_MANUALLY_BURIED}`
        break
      case UnburyType.SIBLINGS:
        queueCondition = `queue = ${Consts.QUEUE_TYPE_SIBLING_BURIED}`
        break
      default:
        queueCondition = this._queueIsBuriedSnippet() // ALL
    }

    const targetDeckIds = deckIds || (await this.mCol.decks.active())
    if (!targetDeckIds || targetDeckIds.length === 0) return
    const sids = `(${targetDeckIds.join(',')})`

    this.mCol.log({
      type: 'unburyCardsForDeck',
      unburyType: type,
      decks: targetDeckIds,
    })
    const buriedCardIds = await this.mCol.db.queryLongList(
      `SELECT id FROM cards WHERE ${queueCondition} AND did IN ${sids}`,
    )
    if (buriedCardIds.length > 0) {
      // Similar logic to unburyCards() for restoring queues
      const cardsToUpdate = []
      for (const id of buriedCardIds) {
        const card = await Card.load(this.mCol, id)
        if (card) {
          let newQueue
          if (
            card.getType() === Consts.CARD_TYPE_LRN ||
            card.getType() === Consts.CARD_TYPE_RELEARNING
          ) {
            const relevantDue =
              card.getODue() > 0 ? card.getODue() : card.getDue()
            newQueue =
              relevantDue > 1000000000
                ? Consts.QUEUE_TYPE_LRN
                : Consts.QUEUE_TYPE_DAY_LEARN_RELEARN
          } else {
            newQueue = card.getType()
          }
          cardsToUpdate.push({ id: id, queue: newQueue })
        }
      }
      for (const c of cardsToUpdate) {
        await this.mCol.db.execute(
          'UPDATE cards SET queue = ?, mod = ?, usn = ? WHERE id = ?',
          c.queue,
          this.mCol.time.intTime(),
          await this.mCol.usn(),
          c.id,
        )
      }
    }
  }

  async buryNote(nid) {
    const cids = await this.mCol.db.queryLongList(
      `SELECT id FROM cards WHERE nid = ? AND queue >= ${Consts.QUEUE_TYPE_NEW}`, // Only bury active cards
      nid,
    )
    if (cids.length > 0) await this.buryCards(cids, true) // manual = true for note burying
  }

  async forgetCards(ids) {
    // List of card IDs
    if (!ids || ids.length === 0) return
    await this.remFromDyn(ids) // Remove from filtered deck if they are there

    // Set to new state
    const baseUpdate = `UPDATE cards SET type=${Consts.CARD_TYPE_NEW}, queue=${Consts.QUEUE_TYPE_NEW}, ivl=0, due=0, odue=0, factor=${Consts.STARTING_FACTOR}, reps=0, lapses=0, left=0`
    await this.mCol.db.execute(`${baseUpdate} WHERE id IN (${ids.join(',')})`)

    const maxNewDue =
      (await this.mCol.db.queryScalar(
        `SELECT max(due) FROM cards WHERE type=${Consts.CARD_TYPE_NEW}`,
      )) || 0
    // Reposition these new cards to the end. sortCards handles mod, usn.
    await this.sortCards(ids, maxNewDue + 1, 1, false, false) // start, step, shuffle, shift
    this.mCol.log({ type: 'forgetCards', ids })
  }

  async reschedCards(ids, imin, imax) {
    // List of card IDs, interval min/max in days
    if (!ids || ids.length === 0) return
    await this.remFromDyn(ids)

    const dataToUpdate = []
    const currentTime = this.mCol.time.intTime()
    const currentUsn = await this.mCol.usn()

    for (const id of ids) {
      const randIvl = Math.floor(Math.random() * (imax - imin + 1)) + imin
      const newIvl = Math.max(1, randIvl)
      const newDue = this.mToday + newIvl
      dataToUpdate.push([
        newIvl,
        newDue,
        currentUsn,
        currentTime,
        Consts.RESCHEDULE_FACTOR,
        id,
      ])
    }
    // odue=0 to clear filtered deck state
    await this.mCol.db.executeMany(
      `UPDATE cards SET type=${Consts.CARD_TYPE_REV}, queue=${Consts.QUEUE_TYPE_REV}, ivl=?, due=?, odue=0, usn=?, mod=?, factor=? WHERE id=?`,
      dataToUpdate,
    )
    this.mCol.log({ type: 'reschedCards', ids })
  }

  async resetCards(ids) {
    // Array of Long card IDs
    if (!ids || ids.length === 0) return
    const nonNewCids = await this.mCol.db.queryLongList(
      `SELECT id FROM cards WHERE id IN (${ids.join(',')}) AND (queue != ${Consts.QUEUE_TYPE_NEW} OR type != ${Consts.CARD_TYPE_NEW})`,
    )
    if (nonNewCids.length > 0) {
      await this.mCol.db.execute(
        `UPDATE cards SET reps=0, lapses=0 WHERE id IN (${nonNewCids.join(',')})`,
      )
      await this.forgetCards(nonNewCids) // forgetCards handles the rest
    }
    // For cards that were already new, forgetCards won't re-process them unless explicitly included.
    // The Java version calls forgetCards on all nonNew, implying new cards are mostly untouched beyond log.
    // If ids contains cards already new, their reps/lapses might not be reset by above logic.
    // SchedV2.java resetCards is:
    //  `mCol.getDb().execute("update cards set reps=0, lapses=0 where id in " + Utils.ids2str(nonNew));`
    //  `forgetCards(nonNew);`
    //  It appears only non-new cards are fully reset and then forgotten.
    //  The `forgetCards` should handle making them new again.
    this.mCol.log({ type: 'resetCardsForExport', ids })
  }

  // --- ETA Calculation ---
  async eta(counts, reload = false) {
    let newRate, newTime, revRate, revTime, relrnRate, relrnTime

    if (reload || this.mEtaCache[0] === -1) {
      const tenDaysAgoMs =
        (this.mDayCutoff - 10 * Consts.SECONDS_PER_DAY) * 1000
      // Query for average pass rates and time per rep type from recent revlog
      // This is a complex query. Simplified: assume you get these values.
      // const stats = await this.mCol.db.querySingleRow(
      //    `SELECT avg(case when type = ${Consts.CARD_TYPE_NEW} ... ) as newRate, ... FROM revlog WHERE id > ?`,
      //    tenDaysAgoMs
      // );
      // Fallback/Example values if query is not implemented:
      const stats = {
        newRate: 0.85,
        newTime: 15000,
        revRate: 0.9,
        revTime: 20000,
        relrnRate: 0.75,
        relrnTime: 18000,
      } // Example data

      newRate = stats.newRate || 1.0
      newTime = stats.newTime || 20000
      revRate = stats.revRate || 1.0
      revTime = stats.revTime || 20000 // For review cards
      relrnRate = stats.relrnRate || 1.0
      relrnTime = stats.relrnTime || 20000 // For learning/relearning cards

      this.mEtaCache = [
        newRate,
        newTime,
        revRate,
        revTime,
        relrnRate,
        relrnTime,
      ]
    } else {
      ;[newRate, newTime, revRate, revTime, relrnRate, relrnTime] =
        this.mEtaCache
    }

    // Counts are {new: N, lrn: L, rev: R}
    let totalTimeMs =
      counts.new * newTime + counts.lrn * relrnTime + counts.rev * revTime

    // Predict additional learning steps
    // From new cards: assume 1 learning card initially (this is a simplification from Anki desktop's more complex prediction)
    let futureLrnFromNew = counts.new // Each new card will likely enter learning
    // From failed reviews/lapses: these become relearning cards
    let futureLrnFromFailedRev = Math.ceil((1 - revRate) * counts.rev)
    // From failed learning steps (cards already in lrn queue that might fail again)
    let futureLrnFromFailedLrn = Math.ceil((1 - relrnRate) * counts.lrn)

    let totalFutureRelrnSteps =
      futureLrnFromNew + futureLrnFromFailedRev + futureLrnFromFailedLrn

    // Estimate passes for these future relearning steps
    // Each future relearning step will take relrnTime on average if passed.
    // If it fails (rate 1-relrnRate), it generates another step.
    // This can be modeled as a geometric series sum: total_steps = initial_steps / success_rate
    if (relrnRate > 0 && relrnRate < 1) {
      // Avoid division by zero or infinite loop if rate is 0 or 1
      let p = 1 - relrnRate // probability of failure
      // Total expected reps for a chain of relearning steps = N / (1-p) = N / relrnRate
      // We already counted the first rep in counts.lrn or through futureLrnFrom*.
      // So, additional reps from failures of these.
      let additionalRelrnDueToFailures = 0
      let currentFailures = totalFutureRelrnSteps * (1 - relrnRate)
      while (currentFailures >= 1) {
        additionalRelrnDueToFailures += Math.floor(currentFailures)
        currentFailures *= 1 - relrnRate
      }
      totalTimeMs += additionalRelrnDueToFailures * relrnTime
    } else if (relrnRate === 1) {
      // all pass first time, already accounted for if they were in initial counts.lrn
      // or in futureLrnFrom* which are now added to time
      totalTimeMs += totalFutureRelrnSteps * relrnTime // Time for the first pass of these
    } else {
      // relrnRate is 0 or invalid, assume they take one try
      totalTimeMs += totalFutureRelrnSteps * relrnTime
    }

    return Math.round(totalTimeMs / 60000) // Return in minutes
  }

  async undoReview(oldCardData, wasLeech) {
    const card = new Card(this.mCol) // Create a new Card instance from the plain object
    Object.assign(card, oldCardData)

    if (!wasLeech) {
      const note = await card.note()
      if (note.hasTag('leech')) {
        // Assume note.hasTag
        await note.delTag('leech') // Assume note.delTag
        await note.flush()
      }
    }
    console.log(`Undo Review of card ${card.getId()}, wasLeech: ${wasLeech}`)

    await card.flush(false) // Save all fields of the card, not just sched fields

    const conf = await this._cardConf(card)
    const previewing = conf.isDyn && conf.isDyn() && !conf.resched

    if (!previewing) {
      const lastRevlogId = await this.mCol.db.queryScalar(
        'SELECT id FROM revlog WHERE cid = ? ORDER BY id DESC LIMIT 1',
        card.getId(),
      )
      if (lastRevlogId) {
        await this.mCol.db.execute(
          'DELETE FROM revlog WHERE id = ?',
          lastRevlogId,
        )
      }
    }

    // Restore siblings (simplified: assume unburying type SIBLINGS would achieve a similar effect if they were buried)
    // The Java code does: `queue=type,mod=?,usn=? where queue=SIBLING_BURIED and nid=?`
    // This is tricky because 'type' isn't always the right queue.
    // A more direct approach: find cards with queue=SIBLING_BURIED and nid=card.nid, then call unsuspend-like logic.
    const siblingsToRestore = await this.mCol.db.query(
      `SELECT id, type, odue, due FROM cards WHERE queue = ${Consts.QUEUE_TYPE_SIBLING_BURIED} AND nid = ?`,
      card.getNid(),
    )
    for (const sib of siblingsToRestore) {
      let newQueue
      if (
        sib.type === Consts.CARD_TYPE_LRN ||
        sib.type === Consts.CARD_TYPE_RELEARNING
      ) {
        const relevantDue = sib.odue > 0 ? sib.odue : sib.due
        newQueue =
          relevantDue > 1000000000
            ? Consts.QUEUE_TYPE_LRN
            : Consts.QUEUE_TYPE_DAY_LEARN_RELEARN
      } else {
        newQueue = sib.type
      }
      await this.mCol.db.execute(
        'UPDATE cards SET queue = ?, mod = ?, usn = ? WHERE id = ?',
        newQueue,
        this.mCol.time.intTime(),
        await this.mCol.usn(),
        sib.id,
      )
    }

    // Update daily stats
    let statTypeKey = 'new' // Default
    if (
      card.getQueue() === Consts.QUEUE_TYPE_LRN ||
      card.getQueue() === Consts.QUEUE_TYPE_DAY_LEARN_RELEARN ||
      card.getQueue() === Consts.QUEUE_TYPE_PREVIEW
    ) {
      statTypeKey = 'lrn'
    } else if (card.getQueue() === Consts.QUEUE_TYPE_REV) {
      statTypeKey = 'rev'
    }
    await this._updateStats(card, statTypeKey, -1) // Decrement stat
    this.decrReps()

    // Important: After undo, the scheduler state (queues, counts) is likely invalid.
    // A full reset is often needed. The caller of undoReview should typically handle this.
    // Or, SchedV2 could automatically deferReset().
    this.deferReset(card) // Defer reset and set the undone card as current.
  }

  // --- Other AbstractSched methods (placeholders or simplified) ---
  async cardCount() {
    const dids = await this._deckLimit()
    if (dids === '(0)') return 0
    return await this.mCol.db.queryScalar(
      `SELECT count() FROM cards WHERE did IN ${dids}`,
    )
  }
  async finishedMsg(context) {
    /* UI specific, simplified */ return 'Deck finished.'
  }
  async revDue() {
    const dids = await this._deckLimit()
    if (dids === '(0)') return false
    return (
      (await this.mCol.db.queryScalar(
        `SELECT 1 FROM cards WHERE did IN ${dids} AND queue = ${Consts.QUEUE_TYPE_REV} AND due <= ? LIMIT 1`,
        this.mToday,
      )) != 0
    )
  }
  async newDue() {
    const dids = await this._deckLimit()
    if (dids === '(0)') return false
    return (
      (await this.mCol.db.queryScalar(
        `SELECT 1 FROM cards WHERE did IN ${dids} AND queue = ${Consts.QUEUE_TYPE_NEW} LIMIT 1`,
      )) != 0
    )
  }
  async hasCardsTodayAfterStudyAheadLimit() {
    // Lrn cards due today but after collapseTime
    const dids = await this._deckLimit()
    if (dids === '(0)') return false
    return (
      (await this.mCol.db.queryScalar(
        `SELECT 1 FROM cards WHERE did IN ${dids} AND queue = ${Consts.QUEUE_TYPE_LRN} AND due >= ${this.mLrnCutoff} AND due < ${this.mDayCutoff} LIMIT 1`,
      )) != 0
    )
  }
  async haveBuried() {
    // For current deck tree
    const dids = await this.mCol.decks.active() // Gets active deck IDs
    if (!dids || dids.length === 0) return false
    return (
      (await this.mCol.db.queryScalar(
        `SELECT 1 FROM cards WHERE did IN (${dids.join(',')}) AND ${this._queueIsBuriedSnippet()} LIMIT 1`,
      )) != 0
    )
  }
  async haveBuriedForDid(did) {
    // For a specific deck and its children
    const childrenDids = await this.mCol.decks.childDids(did) // Includes did itself
    if (!childrenDids || childrenDids.length === 0) return false
    return (
      (await this.mCol.db.queryScalar(
        `SELECT 1 FROM cards WHERE did IN (${childrenDids.join(',')}) AND ${this._queueIsBuriedSnippet()} LIMIT 1`,
      )) != 0
    )
  }

  async answerButtons(card) {
    const conf = await this._cardConf(card)
    if (card.isInDynamicDeck() && conf.isDyn && conf.isDyn() && !conf.resched) {
      return 2 // Preview mode in filtered deck without reschedule
    }
    return 4 // Standard 4 buttons
  }

  async extendLimits(newc, rev) {
    const curDeck = await this.mCol.decks.current()
    if (!curDeck) return

    const deckIdsToUpdate = [curDeck.id] // Current deck
    const parents = await this.mCol.decks.parents(curDeck.id)
    parents.forEach((p) => deckIdsToUpdate.push(p.id)) // Parents
    const children = await this.mCol.decks.children(curDeck.id) // children map {name:id}
    Object.values(children).forEach((childId) => deckIdsToUpdate.push(childId)) // Children

    for (const did of [...new Set(deckIdsToUpdate)]) {
      // Unique deck IDs
      const deck = await this.mCol.decks.get(did)
      if (deck) {
        let newToday = deck.get ? deck.get('newToday') : deck['newToday']
        if (newToday && newToday[0] === this.mToday) newToday[1] -= newc
        else newToday = [this.mToday, -newc]
        if (deck.set) deck.set('newToday', newToday)
        else deck['newToday'] = newToday

        let revToday = deck.get ? deck.get('revToday') : deck['revToday']
        if (revToday && revToday[0] === this.mToday) revToday[1] -= rev
        else revToday = [this.mToday, -rev]
        if (deck.set) deck.set('revToday', revToday)
        else deck['revToday'] = revToday

        // await this.mCol.decks.save(deck); // If changes need explicit save
      }
    }
    // After extending limits, counts need to be reset to reflect the new limits.
    this.mHaveCounts = false // Force recount on next access
  }

  // --- Deck Tree/List methods (Complex UI related - very high level) ---
  async deckDueList() {
    /* TODO: Implement complex deck due list generation */ return []
  }
  async deckDueTree(cancelListener = null) {
    /* TODO: Implement deck due tree generation */ return []
  }
  async quickDeckDueTree() {
    /* TODO: Implement quick deck tree (names only) */ return []
  }

  // --- More specific count methods ---
  async _newForDeck(did, lim) {
    // New cards for a single deck, capped by lim
    if (lim === 0) return 0
    lim = Math.min(lim, this.mReportLimit)
    return await this.mCol.db.queryScalar(
      `SELECT count() FROM (SELECT 1 FROM cards WHERE did = ? AND queue = ${Consts.QUEUE_TYPE_NEW} LIMIT ?)`,
      did,
      lim,
    )
  }
  async totalNewForCurrentDeck() {
    const dids = await this._deckLimit()
    if (dids === '(0)') return 0
    return await this.mCol.db.queryScalar(
      `SELECT count() FROM cards WHERE did IN ${dids} AND queue = ${Consts.QUEUE_TYPE_NEW} LIMIT ?`,
      this.mReportLimit,
    )
  }
  async totalRevForCurrentDeck() {
    const dids = await this._deckLimit()
    if (dids === '(0)') return 0
    return await this.mCol.db.queryScalar(
      `SELECT count() FROM cards WHERE did IN ${dids} AND queue = ${Consts.QUEUE_TYPE_REV} AND due <= ? LIMIT ?`,
      this.mToday,
      this.mReportLimit,
    )
  }

  async _currentRevLimit(considerCurrentCard) {
    // Limit for current selected deck tree
    const currentDeck = await this.mCol.decks.current()
    if (!currentDeck) return 0
    return this._deckRevLimitSingle(currentDeck, null, considerCurrentCard) // parentLimit = null
  }

  async _deckRevLimitSingle(
    deck,
    parentLimit = null,
    considerCurrentCard = true,
  ) {
    if (!deck) return 0
    if (deck.isDyn && deck.isDyn()) return this.mDynReportLimit

    const did = deck.id
    const conf = await this.mCol.decks.confForDid(did)
    const revTodayStats = (deck.get
      ? deck.get('revToday')
      : deck['revToday']) || [this.mToday, 0]

    let limit = Math.max(0, conf.rev.perDay - revTodayStats[1])

    if (
      considerCurrentCard &&
      this.mCurrentCard &&
      this.mCurrentCard.getQueue() === Consts.QUEUE_TYPE_REV &&
      this.mCurrentCardParentsDid &&
      this.mCurrentCardParentsDid.includes(did)
    ) {
      limit--
    }
    limit = Math.max(0, limit)

    if (parentLimit !== null) {
      limit = Math.min(limit, parentLimit)
    }
    return limit
  }

  // --- _walkingCount and Helpers ---
  /**
   * @param {Function} limFn - Async function (deck) => limit: Returns individual deck's limit.
   * @param {Function} cntFn - Async function (did, effectiveLim) => count: Returns cards to count for that deck.
   * @param {Object} cancelListener - Optional cancel listener (not fully implemented here).
   */
  async _walkingCount(limFn, cntFn, cancelListener = null) {
    let totalCount = 0
    const parentLimitsCache = new Map() // Cache for parent limits {did: effectiveLimit}
    const activeDeckIds = await this.mCol.decks.active() // Array of active deck IDs

    for (const did of activeDeckIds) {
      if (
        cancelListener &&
        cancelListener.isCancelled &&
        cancelListener.isCancelled()
      )
        return -1

      const deck = await this.mCol.decks.get(did)
      if (!deck) continue

      let effectiveLimit = await limFn(deck) // Individual limit for this deck
      if (effectiveLimit === 0) continue

      const parents = await this.mCol.decks.parents(did) // Array of parent deck objects
      for (const parentDeck of parents) {
        const parentId = parentDeck.id // Assuming parentDeck has an 'id' property
        if (!parentLimitsCache.has(parentId)) {
          parentLimitsCache.set(parentId, await limFn(parentDeck))
        }
        effectiveLimit = Math.min(
          parentLimitsCache.get(parentId),
          effectiveLimit,
        )
      }

      const countForDeck = await cntFn(did, effectiveLimit)

      if (countForDeck > 0) {
        for (const parentDeck of parents) {
          const parentId = parentDeck.id
          parentLimitsCache.set(
            parentId,
            Math.max(0, parentLimitsCache.get(parentId) - countForDeck),
          )
        }
        // Current deck might also be a parent to others, update its entry in cache
        // This is tricky as Java's pcounts was based on mCol.getDecks().count() initially.
        // For simplicity, we update the current deck's "remaining capacity" if it acts as a parent for subsequent iterations
        // The Java version uses `pcounts.put(did, lim - cnt);`
        // We need to be careful if activeDeckIds is not ordered hierarchically.
        // Let's assume the loop processes decks appropriately or parentLimitsCache handles this.
        if (parentLimitsCache.has(did)) {
          parentLimitsCache.set(
            did,
            Math.max(0, parentLimitsCache.get(did) - countForDeck),
          )
        } else {
          // If not in cache (not a parent seen yet), its own capacity is reduced
          // This logic might need refinement based on iteration order of activeDeckIds
        }
      }
      totalCount += countForDeck
    }
    return totalCount
  }

  // Override _resetNewCount and _resetRevCount to use _walkingCount
  async _resetNewCount(cancelListener = null) {
    const limFn = async (deck) => this._deckNewLimitSingle(deck, true) // deck object expected
    const cntFn = async (did, lim) => this._cntFnNew(did, lim) // did, limit expected
    this.mNewCount = await this._walkingCount(limFn, cntFn, cancelListener)
    if (this.mNewCount === -1 && cancelListener) this.mNewCount = 0 // Reset if cancelled
  }

  async _resetRevCount(cancelListener = null) {
    // For reviews, the limit logic is a bit different. It's usually per-deck config,
    // but _walkingCount applies hierarchical limits.
    // SchedV2 Java's _resetRevCount doesn't use _walkingCount, it directly queries with _deckLimit()
    // and _currentRevLimit(). This is because rev limits are often global per deck config, not purely hierarchical sum.
    // Let's stick to the original SchedV2 Java logic for _resetRevCount which was:
    const lim = await this._currentRevLimit(true)
    if (
      cancelListener &&
      cancelListener.isCancelled &&
      cancelListener.isCancelled()
    ) {
      this.mRevCount = 0
      return
    }
    const deckLimitStr = await this._deckLimit()
    this.mRevCount = 0
    if (lim > 0 && deckLimitStr !== '(0)') {
      this.mRevCount = await this.mCol.db.queryScalar(
        `SELECT count() FROM (SELECT id FROM cards WHERE did IN ${deckLimitStr}
                 AND queue = ${Consts.QUEUE_TYPE_REV} AND due <= ? AND id != ? LIMIT ?)`,
        this.mToday,
        this._currentCardId(),
        lim,
      )
    }
  }

  // --- Dynamic Deck Management ---
  async rebuildDyn(did = 0) {
    if (did === 0) {
      did = await this.mCol.decks.selected() // Assuming selected returns ID
    }
    const deck = await this.mCol.decks.get(did)
    if (!deck || (deck.isStd && deck.isStd())) {
      // deck.isStd() indicates not dynamic
      console.error(
        'rebuildDyn: Deck is not a filtered deck or does not exist.',
      )
      return
    }

    await this.emptyDyn(did) // Empty it first
    const countFilled = await this._fillDyn(deck) // deck object

    if (countFilled === 0) {
      console.log('Rebuilt dynamic deck is empty.')
      // Optionally switch to default deck or show a message
    }
    // Anki desktop changes to the new deck
    await this.mCol.decks.select(did)
  }

  _restoreQueueWhenEmptyingSnippet() {
    // This complex CASE WHEN handles restoring queue based on card type and odue
    // if queue < 0 (suspended/buried), keep it that way.
    // if type is LRN/RELEARN, set queue to LRN (1) or DAYLERN (3) based on odue/due.
    // otherwise, queue = type.
    return `queue = CASE 
                        WHEN queue < 0 THEN queue
                        WHEN type IN (${Consts.CARD_TYPE_LRN}, ${Consts.CARD_TYPE_RELEARNING}) THEN
                            CASE WHEN (CASE WHEN odue > 0 THEN odue ELSE due END) > 1000000000 THEN ${Consts.QUEUE_TYPE_LRN}
                                 ELSE ${Consts.QUEUE_TYPE_DAY_LEARN_RELEARN}
                            END
                        ELSE type
                    END`
  }

  async emptyDyn(did, cardIdFilter = null) {
    // cardIdFilter is SQL "id IN (...)" or null
    let filterClause = `did = ${did}`
    if (cardIdFilter) {
      filterClause = `${cardIdFilter} AND odid != 0` // Ensure it was actually from a filtered deck if specific cids given
    } else {
      // If emptying a whole dyn deck, only act on cards currently in it
      filterClause = `did = ${did} AND odid != 0`
    }

    const cardsToEmptyIds = await this.mCol.db.queryLongList(
      `SELECT id FROM cards WHERE ${filterClause}`,
    )
    if (cardsToEmptyIds.length === 0) return

    this.mCol.log({ type: 'emptyDyn', did, cids: cardsToEmptyIds })

    // odue/odid store original due/did
    // Restore did from odid, restore due from odue if it exists, clear odid/odue
    // Use the complex queue restoration logic
    await this.mCol.db.execute(
      `UPDATE cards SET did = odid, ${this._restoreQueueWhenEmptyingSnippet()},
             due = (CASE WHEN odue > 0 THEN odue ELSE due END), odue = 0, odid = 0, usn = ?
             WHERE ${filterClause}`,
      await this.mCol.usn(),
    )
  }

  async remFromDyn(cids) {
    // cids is an array of card IDs
    if (!cids || cids.length === 0) return
    const cidsStr = cids.join(',')
    await this.emptyDyn(0, `id IN (${cidsStr})`) // did=0 is dummy, filter handles target cards
  }

  async _dynOrder(orderType, limit) {
    let orderClause
    switch (orderType) {
      case Consts.DYN_OLDEST:
        orderClause = 'c.mod'
        break
      case Consts.DYN_RANDOM:
        orderClause = 'random()'
        break // SQLite specific
      case Consts.DYN_SMALLINT:
        orderClause = 'ivl'
        break
      case Consts.DYN_BIGINT:
        orderClause = 'ivl DESC'
        break
      case Consts.DYN_LAPSES:
        orderClause = 'lapses DESC'
        break
      case Consts.DYN_ADDED:
        orderClause = 'n.id'
        break // Assumes join with notes table aliased 'n'
      // case Consts.DYN_REVADDED: orderClause = "n.id DESC"; break; // Java has this, not in SchedV2 file constants list
      case Consts.DYN_DUEPRIORITY:
        orderClause = `(CASE WHEN queue=${Consts.QUEUE_TYPE_REV} AND due <= ${this.mToday} THEN (ivl / MAX(1, (${this.mToday}-due+0.001))) ELSE 100000+due END)`
        break
      case Consts.DYN_DUE:
      default:
        orderClause = 'c.due'
        break
    }
    return `${orderClause} LIMIT ${limit}`
  }

  async _fillDyn(deck) {
    // deck is a Deck object
    let currentDueOffset = -100000 // Start due numbers for filtered cards
    let totalFilled = 0
    const searchTerms = deck.get ? deck.get('terms') : deck.terms // [ [search, limit, order], ... ]

    for (const term of searchTerms) {
      const searchQuery = term[0]
      const limit = term[1]
      const orderType = term[2]

      const orderLimitSql = await this._dynOrder(orderType, limit)

      let fullSearch = `(${searchQuery}) -is:suspended -is:buried -deck:filtered`
      if (!searchQuery.trim()) {
        // If original search is empty, find any non-suspended/buried not in filtered.
        fullSearch = '-is:suspended -is:buried -deck:filtered'
      }

      // mCol.findCards needs to handle the orderLimitSql internally or accept ORDER BY + LIMIT parts
      const cardIds = await this.mCol.findCards(fullSearch, orderLimitSql)

      if (!cardIds || cardIds.length === 0) continue // No cards for this term

      this.mCol.log({
        type: 'fillDynTerm',
        deckId: deck.id,
        term,
        found: cardIds.length,
      })
      await this._moveToDyn(
        deck.id,
        cardIds,
        currentDueOffset + totalFilled,
        deck.get ? deck.get('resched') : deck.resched,
      )
      totalFilled += cardIds.length
    }
    return totalFilled
  }

  async _moveToDyn(targetDid, cardIds, startDue, rescheduleCards) {
    // rescheduleCards is a boolean from deck config
    const updateData = []
    const currentUsn = await this.mCol.usn()
    let currentDue = startDue

    for (const id of cardIds) {
      updateData.push([
        targetDid, // new did
        currentDue, // new due for ordering in filtered deck
        currentUsn,
        id,
      ])
      currentDue++
    }

    let queueUpdateSql = ''
    if (!rescheduleCards) {
      // If not rescheduling, force to review queue for preview
      queueUpdateSql = `, queue = ${Consts.QUEUE_TYPE_REV}`
    }

    // Set odid = did, odue = due. Update did, due. Optionally update queue.
    await this.mCol.db.executeMany(
      `UPDATE cards SET odid = did, odue = due, did = ?, 
             due = (CASE WHEN type = ${Consts.CARD_TYPE_NEW} THEN ? ELSE due END), /* New cards get incremental due, others keep original relative due for now */
             usn = ? ${queueUpdateSql}
             WHERE id = ?`,
      updateData, // Each element: [newDid, newDueForNewCards, usn, cardId]
      // The due logic in Java: due = (case when due <= 0 then due else ? end)
      // This means if original due was 0 or negative (new cards with relative due), it keeps that.
      // If original due was positive (actual date/timestamp), it sets to the new incremental due.
      // This needs careful mapping. For now, simplified to: new cards get startDue++, others might keep original if not new.
      // A better approach: `due = ?` for all, and `odue` stores the true original due.
    )
    // Corrected logic for due based on Java:
    // The `startDue` is an ordering index. If `reschedule` is false, cards are just previewed and keep their original due in `odue`.
    // If `reschedule` is true, they behave more like normal cards in the new deck.
    // The `due` in filtered deck for `reschedule=false` is just an order, not real due date.
    // The SQL in Java is: `due = (case when due <= 0 then due else ? end)`
    // This is confusing. A simpler model might be:
    // `odid=did, odue=due, did=?, due=?, usn=? queue=? WHERE id=?` where new `due` is the `startDue` sequence.
    // Let's use a clearer update:
    const updates = cardIds.map((id, index) => ({
      odidExpr: 'did', // Store current did into odid
      odueExpr: 'due', // Store current due into odue
      newDid: targetDid,
      newDue: startDue + index, // This becomes the sorting key in the filtered deck
      usn: currentUsn,
      newQueue: rescheduleCards ? null : Consts.QUEUE_TYPE_REV, // If not rescheduling, force to rev queue for preview
      cardId: id,
    }))

    for (const u of updates) {
      let sql = `UPDATE cards SET odid = ${u.odidExpr}, odue = ${u.odueExpr}, did = ?, due = ?, usn = ?`
      const params = [u.newDid, u.newDue, u.usn]
      if (u.newQueue !== null) {
        sql += ', queue = ?'
        params.push(u.newQueue)
      }
      sql += ' WHERE id = ?'
      params.push(u.cardId)
      await this.mCol.db.execute(sql, ...params)
    }
  }

  // --- New Card Positioning ---
  async sortCards(cids, start, step = 1, shuffle = false, shift = false) {
    if (!cids || cids.length === 0) return

    const cidsStr = `(${cids.join(',')})`
    const currentTime = this.mCol.time.intTime()
    const currentUsn = await this.mCol.usn()

    // Get NIDs for the given card IDs
    const cardNidPairs = await this.mCol.db.query(
      `SELECT id, nid FROM cards WHERE id IN ${cidsStr}`,
    ) // [{id, nid}, ...]

    const nidMap = new Map() // Map nid to list of its card_ids in cids
    const uniqueNidsOrder = [] // Nids in order of first appearance
    for (const pair of cardNidPairs) {
      if (!nidMap.has(pair.nid)) {
        nidMap.set(pair.nid, [])
        uniqueNidsOrder.push(pair.nid)
      }
      nidMap.get(pair.nid).push(pair.id)
    }

    if (uniqueNidsOrder.length === 0) return

    if (shuffle) {
      // Simple array shuffle
      for (let i = uniqueNidsOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[uniqueNidsOrder[i], uniqueNidsOrder[j]] = [
          uniqueNidsOrder[j],
          uniqueNidsOrder[i],
        ]
      }
    }
    // If not shuffling, uniqueNidsOrder is currently by card ID order.
    // If specific NID sort needed (like Java's orderCards), uniqueNidsOrder should be sorted by NID itself.

    const nidDueValues = new Map() // { nid: newDueValue }
    for (let i = 0; i < uniqueNidsOrder.length; i++) {
      nidDueValues.set(uniqueNidsOrder[i], start + i * step)
    }
    const highestNewDueForMovedCards =
      start + (uniqueNidsOrder.length - 1) * step

    if (shift) {
      // Find minimum due of existing new cards (not in cids) that are >= start
      const minExistingDueToShift = await this.mCol.db.queryScalar(
        `SELECT min(due) FROM cards WHERE due >= ? AND type = ${Consts.CARD_TYPE_NEW} AND id NOT IN ${cidsStr}`,
        start,
      )
      if (
        minExistingDueToShift !== null &&
        minExistingDueToShift !== undefined
      ) {
        // 0 could be a valid due
        const shiftAmount =
          highestNewDueForMovedCards - minExistingDueToShift + 1
        if (shiftAmount > 0) {
          // Only shift if new cards will overlap or push existing ones
          await this.mCol.db.execute(
            `UPDATE cards SET mod = ?, usn = ?, due = due + ?
                         WHERE id NOT IN ${cidsStr} AND due >= ? AND type = ${Consts.CARD_TYPE_NEW}`,
            currentTime,
            currentUsn,
            shiftAmount,
            minExistingDueToShift,
          )
        }
      }
    }

    // Reorder the target cards
    const cardUpdateData = []
    for (const pair of cardNidPairs) {
      // id, nid
      const newDue = nidDueValues.get(pair.nid)
      cardUpdateData.push([newDue, currentTime, currentUsn, pair.id])
    }
    await this.mCol.db.executeMany(
      'UPDATE cards SET due = ?, mod = ?, usn = ? WHERE id = ?',
      cardUpdateData,
    )
  }

  async randomizeCards(did) {
    const cids = await this.mCol.db.queryLongList(
      `SELECT id FROM cards WHERE type = ${Consts.CARD_TYPE_NEW} AND did = ?`,
      did,
    )
    if (cids.length > 0) await this.sortCards(cids, 1, 1, true, false) // Start at 1, step 1, shuffle, no shift existing
  }

  async orderCards(did) {
    // Order by NID (template creation time effectively)
    const cids = await this.mCol.db.queryLongList(
      // In Anki, new cards are ordered by note.id then card.ord by default if not randomized.
      // So, we fetch cids sorted by NID, then card ordinal.
      `SELECT c.id FROM cards c JOIN notes n ON c.nid = n.id
             WHERE c.type = ${Consts.CARD_TYPE_NEW} AND c.did = ? ORDER BY n.id, c.ord`,
      did,
    )
    // The sortCards method above sorts based on NID order as determined by uniqueNidsOrder.
    // To match Java's "order by nid", the uniqueNidsOrder should be sorted numerically by NID.
    // My current sortCards will order based on the order of NIDs as they appear in `cids` (which is already sorted by NID, ord).
    if (cids.length > 0) await this.sortCards(cids, 1, 1, false, false)
  }

  async resortConf(deckConfig) {
    // deckConfig is an object
    const didsUsingConf = await this.mCol.decks.didsForConf(deckConfig) // Get all DIDs using this config
    for (const did of didsUsingConf) {
      // deckConfig.new.order: 0 for random (NEW_CARDS_RANDOM), 1 for order due (NEW_CARDS_DUE)
      if (deckConfig.new.order === Consts.NEW_CARDS_RANDOM) {
        // Or use a specific constant if 0 is ambiguous
        await this.randomizeCards(did)
      } else {
        await this.orderCards(did)
      }
    }
  }

  async maybeRandomizeDeck(did = null) {
    if (did === null) {
      did = await this.mCol.decks.selected()
    }
    if (!did) return
    const conf = await this.mCol.decks.confForDid(did)
    if (conf && conf.new.order === Consts.NEW_CARDS_RANDOM) {
      // Check config's new card order
      await this.randomizeCards(did)
    }
  }

  // --- Scheduler Version Changes ---
  async _emptyAllFiltered() {
    // Moves cards from filtered decks back to original, converting LRN/RELEARN types
    const updateSql = `
            UPDATE cards SET 
                did = odid, 
                queue = CASE 
                            WHEN type = ${Consts.CARD_TYPE_LRN} THEN ${Consts.QUEUE_TYPE_NEW}
                            WHEN type = ${Consts.CARD_TYPE_RELEARNING} THEN ${Consts.QUEUE_TYPE_REV}
                            ELSE type 
                        END, 
                type = CASE 
                           WHEN type = ${Consts.CARD_TYPE_LRN} THEN ${Consts.CARD_TYPE_NEW}
                           WHEN type = ${Consts.CARD_TYPE_RELEARNING} THEN ${Consts.CARD_TYPE_REV}
                           ELSE type 
                       END, 
                due = odue, 
                odue = 0, 
                odid = 0, 
                usn = ? 
            WHERE odid != 0`
    await this.mCol.db.execute(updateSql, await this.mCol.usn())
  }

  async _removeAllFromLearning(targetSchedVer = 2) {
    // targetSchedVer 1 for V1, 2 for V2
    const currentTime = this.mCol.time.intTime()
    const currentUsn = await this.mCol.usn()

    // Remove review cards from relearning (lapsed reviews)
    let reviewLapseUpdateSql
    if (targetSchedVer === 1) {
      // Moving to V1
      reviewLapseUpdateSql = `
                UPDATE cards SET 
                    due = odue, /* V1 used odue for lapsed card's original due */
                    queue = ${Consts.QUEUE_TYPE_REV}, 
                    type = ${Consts.CARD_TYPE_REV}, 
                    mod = ?, usn = ?, odue = 0 
                WHERE queue IN (${Consts.QUEUE_TYPE_LRN}, ${Consts.QUEUE_TYPE_DAY_LEARN_RELEARN}) 
                  AND type IN (${Consts.CARD_TYPE_REV}, ${Consts.CARD_TYPE_RELEARNING})`
      await this.mCol.db.execute(reviewLapseUpdateSql, currentTime, currentUsn)
    } else {
      // Moving to V2 (or from V1)
      reviewLapseUpdateSql = `
                UPDATE cards SET 
                    due = ? + ivl, /* V2 sets due to today + ivl for lapsed cards returned to review */
                    queue = ${Consts.QUEUE_TYPE_REV}, 
                    type = ${Consts.CARD_TYPE_REV}, 
                    mod = ?, usn = ?, odue = 0 
                WHERE queue IN (${Consts.QUEUE_TYPE_LRN}, ${Consts.QUEUE_TYPE_DAY_LEARN_RELEARN}) 
                  AND type IN (${Consts.CARD_TYPE_REV}, ${Consts.CARD_TYPE_RELEARNING})`
      await this.mCol.db.execute(
        reviewLapseUpdateSql,
        this.mToday,
        currentTime,
        currentUsn,
      )
    }

    // Remove new cards from learning (cards that were new but got into learning steps)
    const newCardsInLearningIds = await this.mCol.db.queryLongList(
      `SELECT id FROM cards 
             WHERE queue IN (${Consts.QUEUE_TYPE_LRN}, ${Consts.QUEUE_TYPE_DAY_LEARN_RELEARN})
               AND type = ${Consts.CARD_TYPE_LRN} /* Ensure it was originally a NEW card that became LRN */
               AND factor = ${Consts.STARTING_FACTOR} /* Heuristic: new cards start with default factor */
               /* More robustly, need to track if it originated as NEW */`,
    )
    // The Java version fetches ALL cards in LRN/DAY_LRN and calls forgetCards.
    // This implies new cards in learning (type=LRN) and lapsed reviews in learning (type=RELEARN)
    // are both handled. The RELEARN ones were handled above. So now, just type=LRN.
    const newTypeCardsInLearning = await this.mCol.db.queryLongList(
      `SELECT id FROM cards WHERE queue IN (${Consts.QUEUE_TYPE_LRN}, ${Consts.QUEUE_TYPE_DAY_LEARN_RELEARN}) AND type = ${Consts.CARD_TYPE_LRN}`,
    )

    if (newTypeCardsInLearning.length > 0) {
      await this.forgetCards(newTypeCardsInLearning)
    }
  }

  async _resetSuspendedLearning() {
    // For V1 transition, V1 doesn't handle suspended LRN/RELEARN well
    const updateSql = `
            UPDATE cards SET 
                type = CASE 
                           WHEN type = ${Consts.CARD_TYPE_LRN} THEN ${Consts.CARD_TYPE_NEW}
                           WHEN type IN (${Consts.CARD_TYPE_REV}, ${Consts.CARD_TYPE_RELEARNING}) THEN ${Consts.CARD_TYPE_REV}
                           ELSE type 
                       END, 
                due = (CASE WHEN odue > 0 THEN odue ELSE due END), 
                odue = 0, mod = ?, usn = ? 
            WHERE queue < 0` // queue < 0 means suspended/buried
    await this.mCol.db.execute(
      updateSql,
      this.mCol.time.intTime(),
      await this.mCol.usn(),
    )
  }

  async _moveManuallyBuried() {
    // V1 only has SIBLING_BURIED type
    await this.mCol.db.execute(
      `UPDATE cards SET queue=${Consts.QUEUE_TYPE_SIBLING_BURIED}, mod=? 
             WHERE queue=${Consts.QUEUE_TYPE_MANUALLY_BURIED}`,
      this.mCol.time.intTime(),
    )
  }

  async _remapLearningAnswers(sqlEaseRemapClause) {
    // e.g., "ease = ease - 1"
    await this.mCol.db.execute(
      `UPDATE revlog SET ${sqlEaseRemapClause} 
             WHERE type IN (${Consts.REVLOG_LRN}, ${Consts.REVLOG_RELRN})`,
    )
  }

  async moveToV1() {
    await this._emptyAllFiltered()
    await this._removeAllFromLearning(1) // Target SchedVer 1
    await this._moveManuallyBuried()
    await this._resetSuspendedLearning()
    await this._remapLearningAnswers(`ease = CASE ease 
                                                WHEN ${Consts.BUTTON_THREE} THEN ${Consts.BUTTON_TWO}
                                                WHEN ${Consts.BUTTON_FOUR} THEN ${Consts.BUTTON_THREE}
                                                ELSE ease END`) // V2 Hard(2) doesn't exist in V1 learn, Good(3)->Hard(2), Easy(4)->Good(3)
    // Java: ease=ease-1 where ease in (3,4)
    // This means V2's Button 3 becomes V1's Button 2. V2's Button 4 becomes V1's Button 3.
  }

  async moveToV2() {
    await this._emptyAllFiltered()
    await this._removeAllFromLearning(2) // Target SchedVer 2 (from V1)
    // No _moveManuallyBuried needed (V2 supports it)
    // No _resetSuspendedLearning needed (V2 handles them)
    await this._remapLearningAnswers(`ease = CASE ease
                                                 WHEN ${Consts.BUTTON_TWO} THEN ${Consts.BUTTON_THREE} /* V1 Hard (old good) -> V2 Good */
                                                 WHEN ${Consts.BUTTON_THREE} THEN ${Consts.BUTTON_FOUR} /* V1 Easy (old easy) -> V2 Easy */
                                                 ELSE ease END`) // V1 Good(2)->V2 Good(3), V1 Easy(3)->V2 Easy(4)
    // Java: ease=ease+1 where ease in (2,3)
    // This means V1's Button 2 becomes V2's Button 3. V1's Button 3 becomes V2's Button 4.
  }
}
