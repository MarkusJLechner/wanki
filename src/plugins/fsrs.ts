import { fsrs, Grade, Rating, State } from 'ts-fsrs'
import { wankidb } from '@/plugins/wankidb/db'
import type { Card } from '@/plugins/wankidb/Card'
import { CardType, QueueType } from '@/plugins/conts'
import { creationTimestamp, getConf } from '@/plugins/collection'

const scheduler = fsrs()

function cardTypeToState(
  type: (typeof CardType)[keyof typeof CardType] | undefined,
): State {
  switch (type) {
    case CardType.New:
      return State.New
    case CardType.Learn:
      return State.Learning
    case CardType.Review:
      return State.Review
    case CardType.Relearning:
      return State.Relearning
    default:
      return State.New
  }
}

function stateToCard(state: State, card: Card): void {
  switch (state) {
    case State.New:
      card.type = CardType.New
      card.queue = QueueType.New
      break
    case State.Learning:
      card.type = CardType.Learn
      card.queue = QueueType.Learn
      break
    case State.Review:
      card.type = CardType.Review
      card.queue = QueueType.Review
      break
    case State.Relearning:
      card.type = CardType.Relearning
      card.queue = QueueType.Learn
      break
  }
}

interface FSRSData {
  due: Date
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  state: State
  last_review?: Date
}

function fromCard(card: Card): FSRSData {
  let data: FSRSData = {} as FSRSData
  if (card.data) {
    try {
      data = JSON.parse(card.data) as FSRSData
    } catch {
      data = {} as FSRSData
    }
  }
  return {
    due: new Date(data.due ?? card.due ?? Date.now()),
    stability: data.stability ?? 0,
    difficulty: data.difficulty ?? 0,
    elapsed_days: data.elapsed_days ?? 0,
    scheduled_days: data.scheduled_days ?? 0,
    learning_steps: data.learning_steps ?? 0,
    reps: data.reps ?? card.reps ?? 0,
    lapses: data.lapses ?? card.lapses ?? 0,
    state: data.state ?? cardTypeToState(card.type),
    last_review: data.last_review ? new Date(data.last_review) : undefined,
  }
}

function updateCard(card: Card, next: FSRSData): void {
  const data = {
    due: next.due.getTime(),
    stability: next.stability,
    difficulty: next.difficulty,
    elapsed_days: next.elapsed_days,
    scheduled_days: next.scheduled_days,
    learning_steps: next.learning_steps,
    reps: next.reps,
    lapses: next.lapses,
    state: next.state,
    last_review: next.last_review ? next.last_review.getTime() : null,
  }
  card.data = JSON.stringify(data)
  card.due = next.due.getTime()
  card.reps = next.reps
  card.lapses = next.lapses
  stateToCard(next.state, card)
}

export async function answerCard(card: Card, ease: Rating): Promise<void> {
  if (!card) {
    return
  }
  const now = new Date()

  const fsrsCard = fromCard(card)

  const { card: nextCard, log } = scheduler.next(fsrsCard, now, ease as Grade)

  const originalType = card.type
  updateCard(card, nextCard)

  await card.save()

  const deck = await wankidb.decks.get({ id: card.did })
  if (deck) {
    const { today } = await collectionCreatedAt()
    deck.newToday = deck.newToday ?? [today, 0]
    deck.revToday = deck.revToday ?? [today, 0]
    if (deck.newToday[0] !== today) {
      deck.newToday[0] = today
      deck.newToday[1] = 0
    }
    if (deck.revToday[0] !== today) {
      deck.revToday[0] = today
      deck.revToday[1] = 0
    }
    if (originalType === CardType.New) {
      deck.newToday[1] += 1
    } else {
      deck.revToday[1] += 1
    }
    await deck.save()
  }

  let timeTaken = 0
  if (typeof card.timeTaken !== 'undefined') {
    timeTaken = await card.timeTaken
  }

  await wankidb.revlog.add({
    id: Date.now(),
    cid: card.id,
    usn: 0,
    ease,
    ivl: log.scheduled_days,
    lastIvl: log.last_elapsed_days,
    factor: nextCard.difficulty,
    time: timeTaken,
    type:
      log.state === State.Review ? 1 : log.state === State.Relearning ? 2 : 0,
  })
}

export async function rolloverHour(): Promise<number> {
  const roll = await getConf('rollover', 4)

  if (typeof roll !== 'number') {
    throw new Error('Invalid rollover hour')
  }

  return roll
}

export async function collectionCreatedAt() {
  const created = await creationTimestamp()

  const roll = await rolloverHour()

  const createdDate = new Date(created)
  createdDate.setHours(roll, 0, 0, 0)
  const now = Date.now()
  const today = Math.floor((now - createdDate.getTime()) / 86400000)
  const cutoffDate = new Date()
  cutoffDate.setHours(roll, 0, 0, 0)
  if (cutoffDate.getTime() <= now) {
    cutoffDate.setDate(cutoffDate.getDate() + 1)
  }
  return { today, dayCutoff: cutoffDate.getTime() }
}
