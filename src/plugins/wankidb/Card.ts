import { wankidb } from '@/plugins/wankidb/db'
import { BaseTable } from '@/plugins/wankidb/BaseTable'
import {
  CardType,
  type CardTypeValues,
  getConstName,
  QueueType,
  type QueueTypeValues,
} from '@/plugins/consts'
import { cardDeckConfig } from '@/plugins/collection'
import { collectionCreatedAt, rolloverHour } from '@/plugins/fsrs'
import { now, nowDate } from '@/plugins/time'

// Define interfaces for related types
export interface Note {
  id?: number
  guid?: string
  mid?: number
  mod?: number
  usn?: number
  tags?: string
  flds?: string
  sfld?: string
  csum?: number
  flags?: number
  data?: string
  model: Promise<Model>
}

export interface Model {
  id?: number
  vers?: number
  name?: string
  tags?: string
  did?: number
  usn?: number
  req?: Record<string, unknown>
  flds?: ModelField[]
  sortf?: number
  tmpls?: Template[]
  mod?: number
  latexPost?: string
  type?: number
  css?: string
  latexPre?: string
}

export interface ModelField {
  name?: string
  ord?: number
  sticky?: boolean
  rtl?: boolean
  font?: string
  size?: number
  [key: string]: unknown
}

export interface Template {
  name: string
  ord: number
  qfmt: string
  afmt: string
  bqfmt: string
  bafmt: string
  [key: string]: unknown
}

interface Deck {
  id?: number
  name?: string
  [key: string]: unknown
}

// Interface for the lapse configuration
interface DeckConfigLapse {
  delays?: number[]
  leechAction?: number
  leechFails?: number
  minInt?: number
  mult?: number
}

// Interface for the review configuration
interface DeckConfigRev {
  bury?: boolean
  ease4?: number
  fuzz?: number
  ivlFct?: number
  maxIvl?: number
  minSpace?: number
  perDay?: number
}

// Interface for the new cards configuration
interface DeckConfigNew {
  bury?: boolean
  delays?: number[]
  initialFactor?: number
  ints?: number[]
  order?: number
  perDay?: number
  separate?: boolean
}

// Interface for the configuration returned by cardDeckConfig
interface DeckConfig {
  id?: number
  name?: string
  autoplay?: boolean
  dyn?: number
  lapse?: DeckConfigLapse
  maxTaken: number
  mod?: number
  replayq?: boolean
  rev?: DeckConfigRev
  timer?: number
  usn?: number
  new?: DeckConfigNew
}

wankidb.cards.hook('reading', (obj) => Object.assign(new Card(), obj))

/***
 * Cards are what you review.
 * There can be multiple cards for each note, as determined by the Template.
 */
export class Card extends BaseTable {
  /***
   * the epoch milliseconds of when the card was created
   */
  id?: number

  /***
   * notes.id
   */
  nid?: number

  /***
   * deck id (available in col table)
   */
  did?: number

  /***
   * ordinal : identifies which of the card templates or cloze deletions it corresponds to
   *  for card templates, valid values are from 0 to num templates - 1
   *  for cloze deletions, valid values are from 0 to max cloze index - 1 (they're 0 indexed despite the first being called `c1`)
   */
  ord?: number

  /***
   * modificaton time as epoch seconds
   */
  mod?: number

  /***
   * update sequence number : used to figure out diffs when syncing.
   *  value of -1 indicates changes that need to be pushed to server.
   *  usn < server usn indicates changes that need to be pulled from server.
   */
  usn?: number

  /***
   * 0=new, 1=learning, 2=review, 3=relearning
   */
  type?: CardTypeValues

  /***
   * -3=user buried(In scheduler 2),
   *  -2=sched buried (In scheduler 2),
   *  -2=buried(In scheduler 1),
   *  -1=suspended,
   *  0=new, 1=learning, 2=review (as for type)
   *  3=in learning, next rev in at least a day after the previous review
   *  4=preview
   */
  queue?: QueueTypeValues

  /***
   * Due is used differently for different card types:
   *  new: note id or random int
   *  due: integer day, relative to the collection's creation time
   *  learning: integer timestamp in second
   */
  due?: number

  /***
   * interval (used in SRS algorithm). Negative = seconds, positive = days
   */
  ivl?: number

  /***
   * The ease factor of the card in permille (parts per thousand). If the ease factor is 2500, the card's interval will be multiplied by 2.5 the next time you press Good.
   */
  factor?: number

  /***
   * number of reviews
   */
  reps?: number

  /***
   * the number of times the card went from a "was answered correctly"
   *  to "was answered incorrectly" state
   */
  lapses?: number

  /***
   * of the form a*1000+b, with:
   *  b the number of reps left till graduation
   *  a the number of reps left today
   */
  left?: number

  /***
   * original due: In filtered decks, it's the original due date that the card had before moving to filtered.
   * If the card lapsed in scheduler1, then it's the value before the lapse. (This is used when switching to scheduler 2. At this time, cards in learning becomes due again, with their previous due date)
   * In any other case it's 0.
   */
  odue?: number

  /***
   * original did: only used when the card is currently in filtered deck
   */
  odid?: number

  /***
   * an integer. This integer mod 8 represents a "flag", which can be see in browser and while reviewing a note. Red 1, Orange 2, Green 3, Blue 4, no flag: 0. This integer divided by 8 represents currently nothing
   */
  flags?: number

  /***
   * currently unused
   */
  data?: string

  timerStarted: number

  constructor(load?: Record<string, unknown>) {
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

  isInDynamicDeck(): boolean {
    return !!this.odid
  }

  get note(): Promise<Note> {
    return wankidb.notes.get({ id: this.nid }) as unknown as Promise<Note>
  }

  get deck(): Promise<Deck> {
    return wankidb.decks.get({ id: this.did }) as unknown as Promise<Deck>
  }

  get model(): Promise<Model> {
    return (async () => {
      const note = await this.note
      return note.model
    })()
  }

  get template(): Promise<Template | undefined> {
    return (async () => {
      const model = await this.model
      return model?.tmpls?.[this.ord as number]
    })()
  }

  get fields(): Promise<Array<ModelField & { fieldValue: string }>> {
    return (async () => {
      const model = await this.model
      const note = await this.note
      if (!note) {
        return []
      }
      if (!note.flds) {
        throw new Error('No fields')
      }
      const noteFields = note.flds.split('\u001f')
      if (!model?.flds) {
        return []
      }

      const result: Array<ModelField & { fieldValue: string }> = []
      for (let i = 0; i < model.flds.length; i++) {
        result.push({
          ...model.flds[i],
          fieldValue: noteFields[i] || '',
        })
      }
      return result
    })()
  }

  get css(): Promise<string> {
    return (async () => {
      const model = await this.model
      return model.css || ''
    })()
  }

  increaseRepetition(): void {
    if (this.reps !== undefined) {
      this.reps++
    }
  }

  get queueType(): string | undefined {
    return getConstName(QueueType, this.queue)
  }

  get cardType(): string | undefined {
    return getConstName(CardType, this.type)
  }

  get dueDate(): Promise<Date> {
    return (async () => {
      if (this.due === 1 || this.queue === QueueType.Suspended) {
        return new Date(0)
      }

      let date: Date

      switch (this.type) {
        case CardType.New:
          date = nowDate()
          break
        case CardType.Learn:
          date = new Date(this.due as number)
          break
        case CardType.Relearning:
          date = nowDate()
          break
        case CardType.Review:
          if (('' + this.due).length < 13) {
            const { today } = await collectionCreatedAt()
            const dateToday = nowDate()
            const dueOffset = (this.due as number) - today
            dateToday.setDate(dateToday.getDate() + dueOffset)
            date = dateToday
            date.setHours(await rolloverHour(), 0, 0)
          } else {
            date = new Date(this.due as number)
          }
          break
        default:
          date = nowDate()
          break
      }

      if (isNaN(date.getTime())) {
        return new Date()
      }

      return date
    })()
  }

  startTimer(): void {
    this.timerStarted = now()
  }

  get timeTaken(): Promise<number> {
    return (async () => {
      const nowMs = now()
      const total = Math.floor(nowMs - this.timerStarted)
      const limit = await this.timeLimit
      return Math.min(total, limit)
    })()
  }

  // Get the time limit for this card
  async getTimeLimit(): Promise<number> {
    // Get the deck configuration
    const conf = (await cardDeckConfig(
      this,
      this.isInDynamicDeck(),
    )) as unknown as DeckConfig
    // Return the max time in milliseconds
    return conf.maxTaken * 1000
  }

  get timeLimit(): Promise<number> {
    return this.getTimeLimit()
  }

  isTypeNew(): boolean {
    return this.type === CardType.New
  }

  isTypeLearn(): boolean {
    return this.type === CardType.Learn
  }

  isTypeReview(): boolean {
    return this.type === CardType.Review
  }

  isTypeRelearning(): boolean {
    return this.type === CardType.Relearning
  }
}
