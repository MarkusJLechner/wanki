import {
  CardType,
  NewCardOrder,
  QueueType,
  StatisticType,
} from '@/plugins/conts.js'
import { wankidb } from '@/plugins/wankidb/db.js'
import { cardDeckConfig } from '@/plugins/collection.js'

const reportLimit = 99999
let dayCutof = getDayCutoff()

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
  console.log('Answer card', card.id, ease)
  addUndo(card)
  // todo handle preview
  card.increaseRepetition()

  switch (card.queueType) {
    case QueueType.New:
      card.queueType = QueueType.Learn
      card.type = CardType.Learn
      card.left = await _startingLeft(card)
      updateStatistics(card, StatisticType.New)
      break
  }

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

  console.log({ conf })

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
  const delaysLength = delays.length
  if (!now) {
    now = new Date().getTime()
  }
  let ok = 0
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

export function updateStatistics(card, type) {
  const key = type + 'Today'
  const deckId = card.did
  // todo what happens here??
}

;(async () => {
  const firstCard = (await wankidb.cards.toCollection().limit(1).toArray())[0]
  console.log(await answerCard(firstCard))

  console.log(await _lapseConf(firstCard))
  console.log(await _newConf(firstCard))
})()

const stackUndo = []
const stackUndoLength = 10
export function addUndo(card) {
  const clonedCard = { ...card }
  if (stackUndo.length > stackUndoLength) {
    stackUndo.shift()
  }
  stackUndo.push(clonedCard)
}
