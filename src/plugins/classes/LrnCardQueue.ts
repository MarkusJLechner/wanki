import { LrnCard } from '@/plugins/classes/LrnCard'

class LrnCardQueue {
  isFilled = false
  queue: LrnCard[] = []

  /**
   * Add a learning card to the queue, maintaining sort order.
   *
   * @param {number} due - Due timestamp for the learning card
   * @param {number} cardId - Identifier of the card
   */
  add(due: number, cardId: number): void {
    this.queue.push(new LrnCard(due, cardId))
    this.isFilled = true
    this.sort()
  }

  /** Sort the queue by due date. */
  sort(): void {
    this.queue.sort((a, b) => a.due - b.due)
  }

  /**
   * Return the smallest due timestamp currently in the queue.
   *
   * @returns {number} the earliest due time or 0 if empty
   */
  getFirstDue(): number {
    if (this.queue.length === 0) {
      return 0
    }
    return this.queue[0].due
  }

  /** Remove all queued learning cards. */
  clear(): void {
    this.queue.length = 0
    this.isFilled = false
  }

  /**
   * Check whether the queue is empty.
   *
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return this.queue.length === 0
  }
}

const queue = new LrnCardQueue()

export default queue
