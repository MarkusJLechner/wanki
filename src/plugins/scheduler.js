import {
  CardType,
  Ease,
  Leech,
  NewCardOrder,
  QueueType,
  StatisticType,
} from '@/plugins/conts.js'
import { wankidb } from '@/plugins/wankidb/db.js'
import {
  cardDeckConfig,
  creationTimestamp,
  getColKey,
  getConf,
  getDecks,
  setConf,
} from '@/plugins/collection.js'
import { debug, info, log } from '@/plugins/log.js'
import { Counts } from '@/plugins/classes/Counts.js'
import * as LrnCardQueue from '@/plugins/classes/LrnCardQueue.js'
import { LrnCard } from '@/plugins/classes/LrnCard.js'
import { addToast } from '@/store/globalstate.js'

const reportLimit = 99999
const FACTOR_ADDITION_VALUES = [-150, 0, 150]
let dayCutof = getDayCutoff()

let mToday = 0
let mDayCutoff
let mLrnQueue = LrnCardQueue.default
let mNewCount = 0
let mLrnCount = 0
let mRevCount = 0

const SECONDS_PER_DAY = 86400

async function _updateCutoff() {
  const oldToday = mToday || 0

  const timing = await _timingToday()

  if (!timing) {
    mToday = await _daysSinceCreation()
    mDayCutoff = await _dayCutoff()
  } else if (await _new_timezone_enabled()) {
    mToday = timing.collectionElapsedDays
    mDayCutoff = timing.nextDayTimestamp
  } else {
    mToday = await _daysSinceCreation()
    mDayCutoff = await _dayCutoff()
  }

  if (oldToday !== mToday) {
    info('mCol.log', { mToday, mDayCutoff })
  }

  ;(await getDecks()).forEach((deck) => {
    update(deck)
  })

  const unburied = await getConf('lastUnburied', 0)
  if (unburied < mToday) {
    await setConf('lastUnburied', mToday)
  }
}

async function _timingToday() {
  return sched_timing_today(
    await creationTimestamp(),
    await _creation_timezone_offset(),
    await _rolloverHour(),
  )
}

async function _rolloverHour() {
  return getConf('rollover', 4)
}

async function _creation_timezone_offset() {
  return getConf('creationOffset', 0)
}

function sched_timing_today(collectionCreated, offsetMinutesUtc, rolloverHour) {
  const collectionTimestamp = new Date(collectionCreated)
  const colCreated = collectionTimestamp.setMinutes(
    collectionTimestamp.getMinutes() + offsetMinutesUtc,
  )

  let rollover = new Date().setHours(rolloverHour, 0, 0, 0)
  let now = new Date().getTime()
  let isRolloverPassed = rollover <= now

  const durationDay = SECONDS_PER_DAY * 1000
  const nextDay = isRolloverPassed ? rollover + durationDay : rollover

  const diffDays = diffDaysWithRollover(colCreated, now, isRolloverPassed)

  return {
    // The number of days that have passed since the collection was created.
    collectionElapsedDays: diffDays,
    // Timestamp of the next day rollover
    nextDayTimestamp: nextDay,
  }
}

function diffDaysWithRollover(start, end, rollover_passed) {
  let days = diffDays(start, end)
  days = rollover_passed ? days : days - 1
  return Math.floor(Math.max(0, days))
}

function diffDays(from, to) {
  const date1 = new Date(from)
  const date2 = new Date(to)
  const Difference_In_Time = date2.getTime() - date1.getTime()
  return Difference_In_Time / (1000 * 3600 * 24)
}

async function _daysSinceCreation() {
  const crtTime = new Date(await creationTimestamp())
  crtTime.setHours(await _rolloverHour(), 0, 0, 0)
  const now = new Date()
  return Math.floor(
    (now.getTime() - crtTime.getTime()) / 1000 / SECONDS_PER_DAY,
  )
}

async function _dayCutoff() {
  let rolloverTime = await _rolloverHour()
  if (rolloverTime < 0) {
    rolloverTime = 24 + rolloverTime
  }
  const date = new Date()
  date.setHours(rolloverTime, 0, 0, 0)
  const today = new Date()
  if (date.getTime() < today.getTime()) {
    date.setDate(date.getDate() + 1)
  }

  return date.getTime()
}

async function _new_timezone_enabled() {
  return !!(await getConf('creationOffset', false))
}

function update(deck) {
  ;['new', 'rev', 'lrn', 'time'].forEach((type) => {
    const key = type + 'Today'
    if (!deck[key]) {
      deck[key] = [0, 0]
    }
    const tToday = deck[key]
    if (deck[key][0] !== mToday) {
      tToday[0] = mToday
      tToday[1] = 0
    }
  })
}

function getDayCutoff() {
  let rolloverTime = 4 // todo get from config
  if (rolloverTime < 0) {
    rolloverTime += 24
  }

  const date = new Date()
  date.setHours(rolloverTime)
  if (date.getTime() < new Date().getTime()) {
    date.setDate(date.getDate() + 1)
  }

  return date.getTime() / 1000
}

export async function answerCard(card, ease = 3) {
  if (!card) {
    console.warn('Empty card', card, ease)
    return
  }

  if (!mDayCutoff) {
    await _updateCutoff()
  }

  debug.info('Answer card: ', card.id, ease)

  addUndo(card)
  // todo handle preview
  try {
    card.increaseRepetition()
  } catch (e) {
    console.error(e)
    console.trace(card)
  }

  log('Current card type: ' + card.queueType)

  switch (card.queue) {
    case QueueType.New:
      log('Do review on card type: New')

      card.queue = QueueType.Learn
      card.type = CardType.Learn
      card.left = await _startingLeft(card)
      await updateStatistics(card, StatisticType.New)
      break
    case QueueType.Learn:
    case QueueType.DayLearnRelearn:
      log('Do review on card type: Learn, DayLearnRelearn')

      await _answerLrnCard(card, ease)
      break
    case QueueType.Review:
      log('Do review on card type: Review')
      await _answerRevCard(card, ease)
      await updateStatistics(card, StatisticType.Review)
      break
    default:
      throw new Error('Invalid queue')
  }

  // once a card has been answered once, the original due date
  // no longer applies
  if (card.odue > 0) {
    card.odue = 0
  }

  card.save()

  info('finished review', card)
}

async function _answerRevCard(card, ease) {
  let delay = 0
  const early = card.isInDynamicDeck() && card.odue > mToday
  const type = early ? 3 : 1
  if (ease === Ease.One) {
    delay = await _rescheduleLapse(card)
  } else {
    await _rescheduleRev(card, ease, early)
  }

  await addRevlogReview(card, ease, delay, type)
}

async function _rescheduleLapse(card) {
  const conf = await _lapseConf(card)
  card.lapses++
  card.factor = Math.max(1300, card.factor - 200)
  let delay
  let suspended =
    (await _checkLeech(card, conf)) && card.queue === QueueType.Suspended
  if (conf.delays.length > 0 && !suspended) {
    card.type = CardType.Relearning
    delay = _moveToFirstStep(card, conf)
  } else {
    // no relearning steps
    _updateRevIvlOnFail(card, conf)
    _rescheduleAsRev(card, conf, false)
    // need to reset the queue after rescheduling
    if (suspended) {
      card.queue = QueueType.Suspended
    }
    delay = 0
  }

  return delay
}

async function _checkLeech(card, conf) {
  const lf = conf.leechFails
  if (lf === 0) {
    return false
  }
  // if over threshold or every half threshold reps after that
  if (card.lapses >= lf && (card.lapses - lf) % Math.max(lf / 2, 1) === 0) {
    // add a leech tag
    const n = await card.note

    n.addTag('leech')
    n.save()
    // handle
    if (conf.leechAction === Leech.Suspend) {
      card.queue = QueueType.Suspended
    }
    // notify UI
    // todo maybe get note information
    addToast({ type: 'info', text: 'Card was leeched' })
    return true
  }
  return false
}

async function _rescheduleRev(card, ease, early) {
  // update interval
  card.lastIvl = card.ivl
  if (early) {
    _updateEarlyRevIvl(card, ease)
  } else {
    await _updateRevIvl(card, ease)
  }

  // then the rest
  card.factor = Math.max(1300, card.factor + FACTOR_ADDITION_VALUES[ease - 2])
  card.due = mToday + card.ivl

  // card leaves filtered deck
  _removeFromFiltered(card)
}

function _updateEarlyRevIvl(card, ease) {
  card.ivl = _earlyReviewIvl(card, ease)
}

async function _updateRevIvl(card, ease) {
  card.ivl = await _nextRevIvl(card, ease, true)
}

function _earlyReviewIvl(card, ease) {}

async function _nextRevIvl(card, ease, fuzz) {
  const delay = _daysLate(card)
  const conf = await _revConf(card)
  const fct = card.factor / 1000
  const hardFactor = conf.hardFactor || 1.2
  let hardMin
  if (hardFactor > 1) {
    hardMin = card.ivl
  } else {
    hardMin = 0
  }

  const ivl2 = _constrainedIvl(card.ivl * hardFactor, conf, hardMin, fuzz)
  if (ease === Ease.Two) {
    return ivl2
  }

  const ivl3 = _constrainedIvl((card.ivl + delay / 2) * fct, conf, ivl2, fuzz)
  if (ease === Ease.Three) {
    return ivl3
  }

  return _constrainedIvl(
    (card.ivl + delay) * fct * conf.ease4,
    conf,
    ivl3,
    fuzz,
  )
}

function _daysLate(card) {
  const due = card.isInDynamicDeck() ? card.odue : card.due
  return Math.max(0, mToday - due)
}

async function _revConf(card) {
  const conf = await cardDeckConfig(card, card.isInDynamicDeck())

  return conf.rev
}

function _constrainedIvl(ivl, conf, prev, fuzz) {
  let newIvl = Math.floor(ivl * (conf.ivlFct || 1))
  if (fuzz) {
    newIvl = _fuzzedIvl(newIvl)
  }

  newIvl = Math.floor(Math.max(Math.max(newIvl, prev + 1), 1))
  newIvl = Math.min(newIvl, conf.maxIvl)

  return newIvl
}

async function _startingLeft(card) {
  let conf
  if (card.type === CardType.Relearning) {
    conf = await _lapseConf(card)
  } else {
    conf = await _lrnConf(card)
  }

  const total = conf.delays.length
  const totalDelays = _leftToday(conf.delays, total)

  return total + totalDelays * 1000
}

async function _lapseConf(card) {
  const config = await cardDeckConfig(card)
  if (!card.isInDynamicDeck) {
    return config.lapse
  }

  const dynLapseConf = (await cardDeckConfig(card, true)).lapse
  return {
    minInt: +dynLapseConf.minInt,
    leechFails: +dynLapseConf.leechFails,
    leechAction: +dynLapseConf.leechAction,
    mult: +dynLapseConf.mult,
    delays: dynLapseConf.delays,
    resched: !!config.resched,
  }
}

async function _newConf(card) {
  const config = await cardDeckConfig(card)
  if (!card.isInDynamicDeck) {
    return config.new
  }

  const dynLapseConf = (await cardDeckConfig(card, true)).new

  return {
    ints: dynLapseConf.ints,
    initialFactor: +dynLapseConf.initialFactor,
    bury: !!(dynLapseConf.bury ?? true),
    delays: dynLapseConf.delays,
    separate: !!config.separate,
    order: NewCardOrder.Due,
    perDay: reportLimit,
  }
}

async function _lrnConf(card) {
  if (card.isTypeReview() || card.isTypeRelearning()) {
    return await _lapseConf(card)
  }

  return await _newConf(card)
}

function _leftToday(delays, left, now = 0) {
  if (!now) {
    now = new Date().getTime()
  }
  let ok = 0
  const delaysLength = delays.length
  let offset = Math.min(left, delaysLength)
  for (let i = 0; i < offset; i++) {
    now += Math.floor((delaysLength - offset + i) * 60.0)
    if (now > dayCutof) {
      break
    }
    ok = i
  }
  return ok
}

async function _answerLrnCard(card, ease) {
  const conf = await _lrnConf(card)
  let type
  if (card.type === CardType.Review || card.type === CardType.Relearning) {
    type = CardType.Review
  } else {
    type = CardType.New
  }

  // lrnCount was decremented once when card was fetched
  const lastLeft = card.left
  let leaving = false

  switch (ease) {
    case Ease.Four:
      log('ease FOUR')
      _rescheduleAsRev(card, conf, true)
      leaving = true
      break
    case Ease.Three:
      log('ease Three')
      if ((card.left % 1000) - 1 <= 0) {
        await _rescheduleAsRev(card, conf, true)
      } else {
        _moveToNextStep(card, conf)
      }
      break
    case Ease.Two:
      log('ease Two')
      await _repeatStep(card, conf)
      break
    default:
      log('ease One / default')
      // move back to first step
      await _moveToFirstStep(card, conf)
  }

  await addRevlogLearn(card, ease, conf, leaving, type, lastLeft)
}

async function _moveToFirstStep(card, conf) {
  card.left = await _startingLeft(card)

  if (card.type === CardType.Relearning) {
    await _updateRevIvlOnFail(card, conf)
  }

  return _rescheduleLrnCard(card, conf)
}

function _updateRevIvlOnFail(card, conf) {
  card.lastIvl = card.ivl
  card.ivl = _lapseIvl(card, conf)
}

function _lapseIvl(card, conf) {
  return Math.max(1, Math.max(conf.minInt, Math.floor(card.ivl * conf.mult)))
}

function _moveToNextStep(card, conf) {
  const left = (card.left % 1000) - 1
  card.left = _leftToday(conf.delays, left) * 1000 + left

  return _rescheduleAsRev(card, conf)
}

async function _repeatStep(card, conf) {
  const delay = _delayForRepeatingGrade(conf, card.left)
  return _rescheduleLrnCard(card, conf, delay)
}

function _delayForRepeatingGrade(conf, left) {
  // halfway between last and next
  const delay1 = _delayForGrade(conf, left)
  let delay2
  if (conf.delays.length > 1) {
    delay2 = _delayForGrade(conf, left - 1)
  } else {
    delay2 = delay1 * 2
  }
  return (delay1 + Math.max(delay1, delay2)) / 2
}

async function _rescheduleLrnCard(card, conf, delay) {
  if (!delay) {
    delay = _delayForGrade(conf, card.left)
  }
  card.due = new Date().getTime() + delay
  // due today?
  if (card.due < mDayCutoff) {
    // Add some randomness, up to 5 minutes or 25%
    const maxExtra = Math.min(300, Math.floor(delay * 0.25))
    const fuzz = Math.floor(Math.random() * Math.max(maxExtra, 1))
    card.due = Math.min(mDayCutoff - 1, card.due + fuzz)
    card.queue = QueueType.Learn
    if (
      card.due <
      new Date().getTime() + (await getConf('collapseTime', 1200))
    ) {
      mLrnCount += 1
      // if the queue is not empty and there's nothing else to do, make
      // sure we don't put it at the head of the queue and end up showing
      // it twice in a row
      if (!mLrnQueue.isEmpty() && counts().reviewCount && counts().newCount) {
        const smallestDue = mLrnQueue.getFirstDue()
        card.due = Math.max(card.due, smallestDue + 1)
      }
      _sortIntoLrn(card.due, card.id)
    }
  } else {
    // the card is due in one or more days, so we need to use the day learn queue
    const ahead = (card.due - mDayCutoff) / SECONDS_PER_DAY + 1
    card.due = mToday + ahead
    card.queue = QueueType.DayLearnRelearn
  }
  return delay
}

function counts() {
  return new Counts(mNewCount, mLrnCount, mRevCount)
}

function _sortIntoLrn(due, id) {
  if (!mLrnQueue.isFilled) {
    return
  }

  const queue = mLrnQueue.queue
  const index = queue.findIndex((queueItem) => queueItem.due > due)
  queue.splice(index, 0, new LrnCard(due, id))
}

async function addRevlogReview(card, ease, delay, type) {
  const usn = await getColKey('usn', 0)
  const ivl = delay !== 0 ? -delay : card.ivl
  await addRevLog(
    card.id,
    usn,
    ease,
    ivl,
    card.lastIvl,
    card.factor,
    await card.timeTaken,
    type,
  )
}

async function addRevlogLearn(card, ease, conf, leaving, type, lastLeft) {
  const usn = await getColKey('usn', 0)
  const lastIvl = -_delayForGrade(conf, lastLeft)
  const ivl = leaving ? card.ivl : -_delayForGrade(conf, card.left)
  await addRevLog(
    card.id,
    usn,
    ease,
    ivl,
    lastIvl,
    card.factor,
    await card.timeTaken,
    type,
  )
}

function _delayForGrade(conf, left) {
  left = left % 1000
  try {
    let delay
    const delays = conf.delays
    const len = delays.length
    try {
      delay = delays[len - left]
    } catch (e) {
      console.error(e)
      if (len > 0) {
        delay = delays[0]
      } else {
        // user deleted final step; use dummy value
        delay = 1.0
      }
    }
    return Math.floor(delay * 60)
  } catch (e) {
    console.error(e)
  }
}

async function addRevLog(cardId, usn, ease, ivl, lastIvl, factor, time, type) {
  await wankidb.revlog.add({
    id: new Date().getTime(),
    cid: cardId,
    usn: usn,
    ease: ease,
    ivl: ivl,
    lastIvl: lastIvl,
    factor: factor,
    time: time,
    type: type,
  })
}

function _rescheduleAsRev(card, conf, early) {
  const isLapse =
    card.type === CardType.Review || card.type === CardType.Relearning

  if (isLapse) {
    _rescheduleGraduatingLapse(card, early)
  } else {
    _rescheduleNew(card, conf, early)
  }

  if (card.isInDynamicDeck()) {
    _removeFromFiltered(card)
  }
}

function _rescheduleGraduatingLapse(card, early) {
  if (early) {
    card.ivl++
  }

  card.due += mToday + card.ivl
  card.queue = QueueType.Review
  card.type = CardType.Review
}

function _rescheduleNew(card, conf, early) {
  card.ivl = _graduatingIvl(card, conf, early)
  card.due = mToday + card.ivl
  card.factor = conf.initialFactor
  card.type = CardType.Review
  card.queue = QueueType.Review
}

function _graduatingIvl(card, conf, early, fuzz = false) {
  if (card.type === CardType.Review || card.type === CardType.Relearning) {
    const bonus = early ? 1 : 0
    return card.ivl + bonus
  }
  let ideal
  const ints = conf.ints
  if (!early) {
    // graduate
    ideal = ints[0]
  } else {
    // early remove
    ideal = ints[1]
  }
  if (fuzz) {
    ideal = _fuzzedIvl(ideal)
  }
  return ideal
}

function _fuzzedIvl(ivl) {
  const { min, max } = _fuzzIvlRange(ivl)
  // Anki's python uses random.randint(a, b) which returns x in [a, b] while the eq Random().nextInt(a, b)
  // returns x in [0, b-a), hence the +1 diff with libanki
  return Math.random() * (max - min + 1) + min
}

function _fuzzIvlRange(ivl) {
  let fuzz
  if (ivl < 2) {
    return [1, 1]
  } else if (ivl === 2) {
    return [2, 3]
  } else if (ivl < 7) {
    fuzz = Math.floor(ivl * 0.25)
  } else if (ivl < 30) {
    fuzz = Math.max(2, Math.floor(ivl * 0.15))
  } else {
    fuzz = Math.max(4, Math.floor(ivl * 0.05))
  }
  // fuzz at least a day
  fuzz = Math.max(fuzz, 1)
  return [ivl - fuzz, ivl + fuzz]
}

function _removeFromFiltered(card) {
  if (card.isInDynamicDeck()) {
    card.did = card.oid
    card.odue = 0
    card.odid = 0
  }
}

export async function updateStatistics(card, type, cnt = 1) {
  const key = type + 'Today'
  const deckId = card.did
  const savePromises = []

  const decks = await wankidb.decks.where({ id: deckId }).toArray()
  decks.forEach((deck) => {
    const deckType = deck[key]
    if (deckType && deckType[1]) {
      deckType[1] += cnt
      savePromises.push(deck.save())
    }
  })

  return Promise.all(savePromises)
}

const stackUndo = []
const stackUndoLength = 10
export function addUndo(card) {
  const clonedCard = { ...card }
  if (stackUndo.length > stackUndoLength) {
    stackUndo.shift()
  }
  stackUndo.push(clonedCard)
}
