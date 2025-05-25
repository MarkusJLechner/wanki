import { wankidb } from '@/plugins/wankidb/db.js'
import { QueueType } from '@/plugins/conts.js'
import { collectionCreatedAt } from '@/plugins/scheduler.js'
import { deckConfig } from '@/plugins/collection.js'

export async function getNextCard(deckId) {
  deckId = +deckId || 1
  const cards = await wankidb.cards.where({ did: deckId }).toArray()
  const deck = await wankidb.decks.get({ id: deckId })
  const dconf = await deckConfig(deckId)
  const newLimit = dconf?.new?.perDay ?? Infinity
  const newDone = deck?.newToday?.[1] ?? 0
  const remainingNew = Math.max(newLimit - newDone, 0)

  const { today } = await collectionCreatedAt()
  const now = Date.now()

  const dueLearns = []
  const dueReviews = []
  const newCards = []

  cards.forEach((card) => {
    switch (card.queue) {
      case QueueType.Learn:
      case QueueType.DayLearnRelearn:
        if (card.due <= now) {
          dueLearns.push(card)
        }
        break
      case QueueType.Review:
        if ((card.due < 1e12 && card.due <= today) || card.due <= now) {
          dueReviews.push(card)
        }
        break
      case QueueType.New:
        if (newCards.length < remainingNew) {
          newCards.push(card)
        }
        break
      default:
        break
    }
  })

  const sortFn = (a, b) => a.due - b.due
  dueLearns.sort(sortFn)
  dueReviews.sort(sortFn)
  newCards.sort(sortFn)

  const next = dueLearns[0] || dueReviews[0] || newCards[0] || null
  if (next && typeof next.startTimer === 'function') {
    next.startTimer()
  }
  return next
}

export async function getDueCounts(deckId) {
  deckId = +deckId || 1
  const cards = await wankidb.cards.where({ did: deckId }).toArray()
  const deck = await wankidb.decks.get({ id: deckId })
  const dconf = await deckConfig(deckId)
  const newLimit = dconf?.new?.perDay ?? Infinity
  const newDone = deck?.newToday?.[1] ?? 0
  const remainingNew = Math.max(newLimit - newDone, 0)

  const { today } = await collectionCreatedAt()
  const now = Date.now()

  let newCount = 0
  let reviewCount = 0
  let learnCount = 0

  cards.forEach((card) => {
    switch (card.queue) {
      case QueueType.Learn:
      case QueueType.DayLearnRelearn:
        if (card.due <= now) {
          learnCount += 1
        }
        break
      case QueueType.Review:
        if ((card.due < 1e12 && card.due <= today) || card.due <= now) {
          reviewCount += 1
        }
        break
      case QueueType.New:
        if (newCount < remainingNew) {
          newCount += 1
        }
        break
      default:
        break
    }
  })

  return [newCount, reviewCount, learnCount]
}
