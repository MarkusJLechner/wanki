import { wankidb } from '@/plugins/wankidb/db'
import { QueueType, CardType } from '@/plugins/consts'
import { collectionCreatedAt } from '@/plugins/fsrs'
import { now } from '@/plugins/time'
import { deckConfig } from '@/plugins/collection'

interface Card {
  id?: number
  nid?: number
  did?: number
  ord?: number
  mod?: number
  usn?: number
  type?: number
  queue?: number
  due?: number
  ivl?: number
  factor?: number
  reps?: number
  lapses?: number
  left?: number
  odue?: number
  odid?: number
  flags?: number
  data?: string
  startTimer?: () => void
}

export async function getNextCard(
  deckId: string | number,
): Promise<Card | null> {
  try {
    deckId = +deckId || 1
    const cards = await wankidb.cards.where({ did: deckId }).toArray()
    const { today } = await collectionCreatedAt()
    const nowMs = now()

    const dueLearns: Card[] = []
    const dueReviews: Card[] = []
    const newCards: Card[] = []

    cards.forEach((card) => {
      switch (card.queue) {
        case QueueType.Learn:
          if (card.due && card.due <= nowMs) {
            dueLearns.push(card)
          }
          break
        case QueueType.DayLearnRelearn:
          if (card.due && card.due <= today) {
            dueLearns.push(card)
          }
          break
        case QueueType.Review:
          if (
            card.due &&
            ((card.due < 1e12 && card.due <= today) || card.due <= nowMs)
          ) {
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

    const sortFn = (a: Card, b: Card) => (a.due || 0) - (b.due || 0)
    dueLearns.sort(sortFn)
    dueReviews.sort(sortFn)
    newCards.sort(sortFn)
    let next = dueLearns[0] || dueReviews[0] || null

    if (!next && newCards[0]) {
      const deck = await wankidb.decks.get({ id: deckId })
      const conf = await deckConfig(deckId)

      let allowNew = true
      if (deck && conf) {
        const newToday = deck.newToday || [0, 0]
        const revToday = deck.revToday || [0, 0]

        if (newToday[0] !== today) {
          newToday[1] = 0
        }
        if (revToday[0] !== today) {
          revToday[1] = 0
        }

        let newLimit = (conf.new?.perDay ?? 0) - newToday[1]
        if (!conf.new?.ignoreReviewLimit) {
          const revLimit = (conf.rev?.perDay ?? 0) - revToday[1]
          if (revLimit <= 0) {
            newLimit = 0
          }
        }
        allowNew = newLimit > 0
      }

      if (allowNew) {
        next = newCards[0]
      }
    }

    if (next && typeof next.startTimer === 'function') {
      next.startTimer()
    }
    return next
  } catch (e) {
    console.error(
      `Failed to get next card for deck ${deckId}. Error details:`,
      {
        type: e?.constructor?.name,
        message: e?.message,
        stack: e?.stack,
      },
    )
    return null
  }
}

export async function getDueCounts(
  deckId: string | number,
): Promise<[number, number, number]> {
  deckId = +deckId || 1
  try {
    const cards = await wankidb.cards.where({ did: deckId }).toArray()
    const deck = await wankidb.decks.get({ id: deckId })

    const conf = await deckConfig(deckId)
    const { today } = await collectionCreatedAt()
    const nowMs = now()

    let newCount = 0
    let reviewCount = 0
    let learnCount = 0

    cards.forEach((card) => {
      switch (card.type) {
        case CardType.New:
          newCount += 1
          break
        case CardType.Learn:
        case CardType.Relearning:
          // For DayLearnRelearn cards, we need to check if due <= today
          // For other cards, we need to check if due <= nowMs
          if (
            card.queue === QueueType.DayLearnRelearn
              ? card.due !== undefined && card.due <= today
              : card.due !== undefined && card.due <= nowMs
          ) {
            learnCount += 1
          }
          break
        case CardType.Review:
          if (
            card.due !== undefined &&
            ((card.due < 1e12 && card.due <= today) || card.due <= nowMs)
          ) {
            reviewCount += 1
          }
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

      const revLimit = Math.max(0, (conf.rev?.perDay ?? 0) - revToday[1])
      let newLimit = Math.max(0, (conf.new?.perDay ?? 0) - newToday[1])
      if (!conf.new?.ignoreReviewLimit && revLimit <= 0) {
        newLimit = 0
      }
      newCount = Math.min(newCount, newLimit)
      reviewCount = Math.min(reviewCount, revLimit)
    }

    return [newCount, reviewCount, learnCount]
  } catch (e) {
    console.error(
      `Failed to get due counts for deck ${deckId}. Error details:`,
      {
        type: e?.constructor?.name,
        message: e?.message,
        stack: e?.stack,
      },
    )
    return [0, 0, 0]
  }
}
