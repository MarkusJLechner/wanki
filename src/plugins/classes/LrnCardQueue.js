import { LrnCard } from '@/plugins/classes/LrnCard.js'

class LrnCardQueue {
  isFilled = false

  queue = []

  add(due, cardId) {
    this.queue.push(new LrnCard(due, cardId))
    console.log('LrnCardQueue :: add')
  }
  sort() {
    console.log('LrnCardQueue :: sort')
  }
  getFirstDue() {
    console.log('LrnCardQueue :: getFirstDue')
    return 0
  }
  clear() {
    console.log('LrnCardQueue :: clear')
  }
  isEmpty() {
    console.log('LrnCardQueue :: isEmpty')
    return true
  }
}

const queue = new LrnCardQueue()

export default queue
