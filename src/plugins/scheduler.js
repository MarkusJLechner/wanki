import {
  CardType,
  Ease,
  NewCardOrder,
  QueueType,
  StatisticType,
} from '@/plugins/conts.js'
import { wankidb } from '@/plugins/wankidb/db.js'
import {
  cardDeckConfig,
  creationTimestamp,
  getCol,
  getColKey,
  getConf,
  getDecks,
  setConf,
} from '@/plugins/collection.js'
import { debug, info, log } from '@/plugins/log.js'

const reportLimit = 99999
let dayCutof = getDayCutoff()

let mToday = 0
let mDayCutoff

_updateCutoff()
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

  console.log({ timing, mToday, mDayCutoff })

  if (oldToday !== mToday) {
    info('mCol.log', mToday, mDayCutoff)
    // todo was ist das? mCol.log(mToday, mDayCutoff);
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

  const durationDay = 1000 * 60 * 60 * 24 // 86400000
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
  const daySeconds = 86400
  return Math.floor((now.getTime() - crtTime.getTime()) / 1000 / daySeconds)
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
  debug.info('Answer card: ', card.id, ease)

  addUndo(card)
  // todo handle preview
  card.increaseRepetition()

  log('Current card type: ' + card.queueType)

  switch (card.queue) {
    case QueueType.New:
      log('Do New')

      card.queue = QueueType.Learn
      card.type = CardType.Learn
      card.left = await _startingLeft(card)
      await updateStatistics(card, StatisticType.New)
      break
    case QueueType.Learn:
    case QueueType.DayLearnRelearn:
      log('Do Learn, DayLearnRelearn')

      await _answerLrnCard(card, ease)
      break
    case QueueType.Review:
      log('Do Review')

      break
  }

  console.log(card)

  // todo here
  return {
    queueType: QueueType.Learn,
    type: CardType.Learn,
    left: await _startingLeft(card),
  }
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
  const deckConfig = await cardDeckConfig(card)
  let type
  if (card.type === CardType.Review || card.type === CardType.Relearning) {
    type = CardType.Review
  } else {
    type = CardType.New
  }

  const lastLeft = card.left
  let leaving = false

  switch (ease) {
    case Ease.Four:
      log('FOUR')
      break
    case Ease.Three:
      log('Three')
      break
    case Ease.Two:
      log('Two')
      break
    case Ease.One:
      log('One')
      break
    default:
      log('Again')
  }

  await addRevlogLearn(card, ease, deckConfig, leaving, type, lastLeft)
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
    const delays = getConf('delays', [])
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

async function addRevLog(id, cid, usn, ease, ivl, lastIvl, factor, time, type) {
  await wankidb.revlog.add({
    id: id,
    cid: cid,
    usn: usn,
    ease: ease,
    ivl: ivl,
    lastIvl: lastIvl,
    factor: factor,
    time: time,
    type: type,
  })
}

async function _rescheduleAsRev(card, conf, early) {
  const isLapse =
    card.type === CardType.Review || card.type === CardType.Relearning

  if (isLapse) {
    await _rescheduleGraduatingLapse(card, early)
  } else {
    await _rescheduleNew(card, conf, early)
  }

  if (card.isInDynamicDeck()) {
    await _removeFromFiltered(card)
  }
}

async function _rescheduleGraduatingLapse(card, early) {
  if (early) {
    card.ivl++
  }

  card.due += 2222
  card.queue = QueueType.Review
  card.type = CardType.Review
}
async function _rescheduleNew(card, conf, early) {}
async function _removeFromFiltered(card) {}

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

;(async () => {
  const firstCard = (await wankidb.cards.toCollection().limit(1).toArray())[0]

  if (!firstCard) {
    return
  }

  debug.info('result', await answerCard(firstCard))
})()

const stackUndo = []
const stackUndoLength = 10
export function addUndo(card) {
  const clonedCard = { ...card }
  if (stackUndo.length > stackUndoLength) {
    stackUndo.shift()
  }
  stackUndo.push(clonedCard)

  debug.log('added undo', stackUndo)
}
