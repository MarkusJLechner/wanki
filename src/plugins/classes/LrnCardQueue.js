import { LrnCard } from '@/plugins/classes/LrnCard.js'

class LrnCardQueue {
  isFilled = false

  queue = []

  /**
   * Add a learning card to the queue, maintaining sort order.
   *
   * @param {number} due - Due timestamp for the learning card
   * @param {number} cardId - Identifier of the card
   */
  add(due, cardId) {
    this.queue.push(new LrnCard(due, cardId))
    this.isFilled = true
    this.sort()
  }

  /** Sort the queue by due date. */
  sort() {
    this.queue.sort((a, b) => a.due - b.due)
  }

  /**
   * Return the smallest due timestamp currently in the queue.
   *
   * @returns {number} the earliest due time or 0 if empty
   */
  getFirstDue() {
    if (this.queue.length === 0) {
      return 0
    }
    return this.queue[0].due
  }

  /** Remove all queued learning cards. */
  clear() {
    this.queue.length = 0
    this.isFilled = false
  }

  /**
   * Check whether the queue is empty.
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this.queue.length === 0
  }
}

const queue = new LrnCardQueue()

export default queue
