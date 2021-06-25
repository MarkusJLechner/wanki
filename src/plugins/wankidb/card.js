import { wankidb } from '@/plugins/wankidb/db.js'

/***
 * Cards are what you review.
 * There can be multiple cards for each note, as determined by the Template.
 */
export class Card {
  constructor({ id } = {}) {
    if (id) {
      this.load(id)
    }
    this.id = new Date().getTime()
  }

  async load(id) {
    const entry = await wankidb.cards.where('id').equals(id).first()

    this.id = entry.id
    this.nid = entry.nid
    this.did = entry.did
    this.ord = entry.ord
    this.mod = entry.mod
    this.usn = entry.usn
    this.type = entry.type
    this.queue = entry.queue
    this.due = entry.due
    this.ivl = entry.ivl
    this.factor = entry.factor
    this.reps = entry.reps
    this.lapses = entry.lapses
    this.left = entry.left
    this.odue = entry.odue
    this.odid = entry.odid
    this.flags = entry.flags
    this.data = entry.data
  }

  #add() {
    return wankidb.cards.add({
      id: this.id,
      nid: this.nid,
      did: this.did,
      ord: this.ord,
      mod: this.mod,
      usn: this.usn,
      type: this.type,
      queue: this.queue,
      due: this.due,
      ivl: this.ivl,
      factor: this.factor,
      reps: this.reps,
      lapses: this.lapses,
      left: this.left,
      odue: this.odue,
      odid: this.odid,
      flags: this.flags,
      data: this.data,
    })
  }

  save() {
    if (!this.id) {
      return this.#add()
    }

    return wankidb.cards.put(this)
  }

  get note() {
    return wankidb.notes.get({ id: this.nid })
  }

  get field_field_mid() {
    return this.mid
  }

  /***
   * the epoch milliseconds of when the card was created
   * @returns {number}
   */
  get field_field_id() {
    return this.id
  }

  /***
   * notes.id
   * @returns {number}
   */
  get field_field_nid() {
    return this.nid
  }

  /***
   * deck id (available in col table)
   * @returns {number}
   */
  get field_field_did() {
    return this.did
  }

  /***
   * ordinal : identifies which of the card templates or cloze deletions it corresponds to
   *  for card templates, valid values are from 0 to num templates - 1
   *  for cloze deletions, valid values are from 0 to max cloze index - 1 (they're 0 indexed despite the first being called `c1`)
   * @returns {number}
   */
  get field_field_ord() {
    return this.ord
  }

  /***
   * modificaton time as epoch seconds
   * @returns {number}
   */
  get field_field_mod() {
    return this.mod
  }

  /***
   * update sequence number : used to figure out diffs when syncing.
   *  value of -1 indicates changes that need to be pushed to server.
   *  usn < server usn indicates changes that need to be pulled from server.
   * @returns {number}
   */
  get field_field_usn() {
    return this.usn
  }

  /***
   * 0=new, 1=learning, 2=review, 3=relearning
   * @returns {number}
   */
  get field_field_type() {
    return this.type
  }

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
  get field_field_queue() {
    return this.queue
  }

  /***
   * Due is used differently for different card types:
   *  new: note id or random int
   *  due: integer day, relative to the collection's creation time
   *  learning: integer timestamp in second
   * @returns {number}
   */
  get field_field_due() {
    return this.due
  }

  /***
   * interval (used in SRS algorithm). Negative = seconds, positive = days
   * @returns {number}
   */
  get field_field_ivl() {
    return this.ivl
  }

  /***
   * The ease factor of the card in permille (parts per thousand). If the ease factor is 2500, the card’s interval will be multiplied by 2.5 the next time you press Good.
   * @returns {number}
   */
  get field_field_factor() {
    return this.factor
  }

  /***
   * number of reviews
   * @returns {number}
   */
  get field_field_reps() {
    return this.reps
  }

  /***
   * the number of times the card went from a "was answered correctly"
   *  to "was answered incorrectly" state
   * @returns {number}
   */
  get field_field_lapses() {
    return this.lapses
  }

  /***
   * of the form a*1000+b, with:
   *  b the number of reps left till graduation
   *  a the number of reps left today
   * @returns {number}
   */
  get field_field_left() {
    return this.left
  }

  /***
   * original due: In filtered decks, it's the original due date that the card had before moving to filtered.
   * If the card lapsed in scheduler1, then it's the value before the lapse. (This is used when switching to scheduler 2. At this time, cards in learning becomes due again, with their previous due date)
   * In any other case it's 0.
   * @returns {number}
   */
  get field_field_odue() {
    return this.odue
  }

  /***
   * original did: only used when the card is currently in filtered deck
   * @returns {number}
   */
  get field_field_odid() {
    return this.odid
  }

  /***
   * an integer. This integer mod 8 represents a "flag", which can be see in browser and while reviewing a note. Red 1, Orange 2, Green 3, Blue 4, no flag: 0. This integer divided by 8 represents currently nothing
   * @returns {number}
   */
  get field_field_flags() {
    return this.flags
  }

  /***
   * currently unused
   * @returns {string}
   */
  get field_field_data() {
    return this.data
  }
}

wankidb.cards.mapToClass(Card)
