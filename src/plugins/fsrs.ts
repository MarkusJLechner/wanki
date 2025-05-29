import { fsrs, Rating, State } from 'ts-fsrs'
import { wankidb } from '@/plugins/wankidb/db'
import { CardType, QueueType } from '@/plugins/conts'
import { creationTimestamp, getConf } from '@/plugins/collection'

const scheduler = fsrs()

function cardTypeToState(type: number): State {
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

function stateToCard(state: State, card: any) {
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

function fromCard(card: any) {
  let data: any = {}
  if (card.data) {
    try {
      data = JSON.parse(card.data)
    } catch {
      data = {}
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

function updateCard(card: any, next: any) {
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

export async function answerCard(card: any, ease: number) {
  if (!card) return
  const now = new Date()
  const fsrsCard = fromCard(card)
  const { card: nextCard, log } = scheduler.next(fsrsCard, now, ease as Rating)
  updateCard(card, nextCard)
  await card.save()
  await wankidb.revlog.add({
    id: Date.now(),
    cid: card.id,
    usn: 0,
    ease,
    ivl: log.scheduled_days,
    lastIvl: log.last_elapsed_days,
    factor: nextCard.difficulty,
    time: card.timeTaken ? await card.timeTaken : 0,
    type:
      log.state === State.Review ? 1 : log.state === State.Relearning ? 2 : 0,
  })
}

export async function rolloverHour() {
  return getConf('rollover', 4)
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
