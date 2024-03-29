import { wankidb } from '@/plugins/wankidb/db.js'
import { BaseTable } from '@/plugins/wankidb/BaseTable.js'
import { CardType, getConstName, QueueType } from '@/plugins/conts.js'
import { cardDeckConfig } from '@/plugins/collection.js'
import { collectionCreatedAt, rolloverHour } from '@/plugins/scheduler.js'
wankidb.cards.hook('reading', (obj) => Object.assign(new Card(), obj))

/***
 * Cards are what you review.
 * There can be multiple cards for each note, as determined by the Template.
 */
export class Card extends BaseTable {
  /***
   * the epoch milliseconds of when the card was created
   * @returns {number}
   */
  id
  /***
   * notes.id
   * @returns {number}
   */
  nid
  /***
   * deck id (available in col table)
   * @returns {number}
   */
  did
  /***
   * ordinal : identifies which of the card templates or cloze deletions it corresponds to
   *  for card templates, valid values are from 0 to num templates - 1
   *  for cloze deletions, valid values are from 0 to max cloze index - 1 (they're 0 indexed despite the first being called `c1`)
   * @returns {number}
   */
  ord
  /***
   * modificaton time as epoch seconds
   * @returns {number}
   */
  mod
  /***
   * update sequence number : used to figure out diffs when syncing.
   *  value of -1 indicates changes that need to be pushed to server.
   *  usn < server usn indicates changes that need to be pulled from server.
   * @returns {number}
   */
  usn
  /***
   * 0=new, 1=learning, 2=review, 3=relearning
   * @returns {number}
   */
  type
  /***
   * -3=user buried(In scheduler 2),
   *  -2=sched buried (In scheduler 2),
   *  -2=buried(In scheduler 1),
   *  -1=suspended,
   *  0=new, 1=learning, 2=review (as for type)
   *  3=in learning, next rev in at least a day after the previous review
   *  4=preview
   * @returns {number}
   */
  queue
  /***
   * Due is used differently for different card types:
   *  new: note id or random int
   *  due: integer day, relative to the collection's creation time
   *  learning: integer timestamp in second
   * @returns {number}
   */
  due
  /***
   * interval (used in SRS algorithm). Negative = seconds, positive = days
   * @returns {number}
   */
  ivl
  /***
   * The ease factor of the card in permille (parts per thousand). If the ease factor is 2500, the card’s interval will be multiplied by 2.5 the next time you press Good.
   * @returns {number}
   */
  factor
  /***
   * number of reviews
   * @returns {number}
   */
  reps
  /***
   * the number of times the card went from a "was answered correctly"
   *  to "was answered incorrectly" state
   * @returns {number}
   */
  lapses
  /***
   * of the form a*1000+b, with:
   *  b the number of reps left till graduation
   *  a the number of reps left today
   * @returns {number}
   */
  left
  /***
   * original due: In filtered decks, it's the original due date that the card had before moving to filtered.
   * If the card lapsed in scheduler1, then it's the value before the lapse. (This is used when switching to scheduler 2. At this time, cards in learning becomes due again, with their previous due date)
   * In any other case it's 0.
   * @returns {number}
   */
  odue
  /***
   * original did: only used when the card is currently in filtered deck
   * @returns {number}
   */
  odid
  /***
   * an integer. This integer mod 8 represents a "flag", which can be see in browser and while reviewing a note. Red 1, Orange 2, Green 3, Blue 4, no flag: 0. This integer divided by 8 represents currently nothing
   * @returns {number}
   */
  flags
  /***
   * currently unused
   * @returns {string}
   */
  data

  constructor(load) {
    super(
      'cards',
      [
        'id',
        'nid',
        'did',
        'ord',
        'mod',
        'usn',
        'type',
        'queue',
        'due',
        'ivl',
        'factor',
        'reps',
        'lapses',
        'left',
        'odue',
        'odid',
        'flags',
        'data',
      ],
      load,
    )

    this.timerStarted = 0
  }

  isInDynamicDeck() {
    return !!this.odid
  }

  get note() {
    return wankidb.notes.get({ id: this.nid })
  }

  get deck() {
    return wankidb.decks.get({ id: this.did })
  }

  get model() {
    return (async () => {
      const note = await this.note
      return note.model
    })()
  }

  get template() {
    return (async () => {
      const model = await this.model
      return model?.tmpls[this.ord]
    })()
  }

  get fields() {
    return (async () => {
      const model = await this.model
      const note = await this.note
      if (!note) {
        return []
      }
      const noteFields = note.flds.split('\u001f')
      return model?.flds.map((modelFields, index) => {
        return {
          ...modelFields,
          fieldValue: noteFields[index],
        }
      })
    })()
  }

  get css() {
    return (async () => {
      const model = await this.model
      return model.css
    })()
  }

  increaseRepetition() {
    this.reps++
  }

  get queueType() {
    return getConstName(QueueType, this.queue)
  }

  get cardType() {
    return getConstName(CardType, this.type)
  }

  get dueDate() {
    return (async () => {
      if (this.due === 1 || this.queue === QueueType.Suspended) {
        return new Date(0)
      }

      let date

      switch (this.type) {
        case CardType.New:
          date = new Date()
          break
        case CardType.Learn:
          date = new Date(this.due)
          break
        case CardType.Relearning:
          date = new Date()
          break
        case CardType.Review:
          if (('' + this.due).length < 13) {
            const { today } = await collectionCreatedAt()
            const dateToday = new Date()
            dateToday.setDate(dateToday.getDate() + (this.due - today))
            date = dateToday
            date.setHours(await rolloverHour(), 0, 0)
          } else {
            date = new Date(this.due)
          }
          break
        default:
          date = new Date()
          break
      }

      if (isNaN(date)) {
        return new Date()
      }

      return date
    })()
  }

  startTimer() {
    this.timerStarted = new Date().getTime()
  }

  get timeTaken() {
    return (async () => {
      const now = new Date().getTime()
      const total = Math.floor(now - this.timerStarted)
      return Math.min(total, await this.timeLimit)
    })()
  }

  get timeLimit() {
    return (async () => {
      const conf = await cardDeckConfig(this, this.isInDynamicDeck())
      return conf.maxTaken * 1000
    })()
  }

  isTypeNew() {
    return this.type === CardType.New
  }

  isTypeLearn() {
    return this.type === CardType.Learn
  }

  isTypeReview() {
    return this.type === CardType.Review
  }

  isTypeRelearning() {
    return this.type === CardType.Relearning
  }
}
