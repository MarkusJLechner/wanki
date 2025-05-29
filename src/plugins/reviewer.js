import { wankidb } from '@/plugins/wankidb/db.js'
import { QueueType } from '@/plugins/conts.js'
import { collectionCreatedAt } from '@/plugins/scheduler.js'
import { deckConfig } from '@/plugins/collection.js'

export async function getNextCard(deckId) {
  deckId = +deckId || 1
  const cards = await wankidb.cards.where({ did: deckId }).toArray()
  const { today } = await collectionCreatedAt()
  const now = Date.now()

  const dueLearns = []
  const dueReviews = []
  const newCards = []

  cards.forEach((card) => {
    switch (card.queue) {
      case QueueType.Learn:
        if (card.due <= now) {
          dueLearns.push(card)
        }
        break
      case QueueType.DayLearnRelearn:
        if (card.due <= today) {
          dueLearns.push(card)
        }
        break
      case QueueType.Review:
        if ((card.due < 1e12 && card.due <= today) || card.due <= now) {
          dueReviews.push(card)
        }
        break
      case QueueType.New:
        newCards.push(card)
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
  const conf = await deckConfig(deckId)
  const { today } = await collectionCreatedAt()
  const now = Date.now()

  let newCount = 0
  let reviewCount = 0
  let learnCount = 0

  cards.forEach((card) => {
    switch (card.queue) {
      case QueueType.Learn:
        if (card.due <= now) {
          learnCount += 1
        }
        break
      case QueueType.DayLearnRelearn:
        if (card.due <= today) {
          learnCount += 1
        }
        break
      case QueueType.Review:
        if ((card.due < 1e12 && card.due <= today) || card.due <= now) {
          reviewCount += 1
        }
        break
      case QueueType.New:
        newCount += 1
        break
      default:
        break
    }
  })

  // Apply daily limits based on deck configuration
  if (deck && conf) {
    const newToday = deck.newToday || [0, 0]
    const revToday = deck.revToday || [0, 0]

    if (newToday[0] !== today) {
      newToday[1] = 0
    }
    if (revToday[0] !== today) {
      revToday[1] = 0
    }

    const newLimit = Math.max(0, (conf.new?.perDay ?? 0) - newToday[1])
    const revLimit = Math.max(0, (conf.rev?.perDay ?? 0) - revToday[1])
    newCount = Math.min(newCount, newLimit)
    reviewCount = Math.min(reviewCount, revLimit)
  }

  return [newCount, reviewCount, learnCount]
}
