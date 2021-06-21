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
    this._id = new Date().getTime()
  }

  async load(id) {
    const entry = await wankidb.cards.where('id').equals(id).first()

    this._id = entry.id
    this._nid = entry.nid
    this._did = entry.did
    this._ord = entry.ord
    this._mod = entry.mod
    this._usn = entry.usn
    this._type = entry.type
    this._queue = entry.queue
    this._due = entry.due
    this._ivl = entry.ivl
    this._factor = entry.factor
    this._reps = entry.reps
    this._lapses = entry.lapses
    this._left = entry.left
    this._odue = entry.odue
    this._odid = entry.odid
    this._flags = entry.flags
    this._data = entry.data
  }

  _add() {
    return wankidb.cards.add({
      id: this._id,
      nid: this._nid,
      did: this._did,
      ord: this._ord,
      mod: this._mod,
      usn: this._usn,
      type: this._type,
      queue: this._queue,
      due: this._due,
      ivl: this._ivl,
      factor: this._factor,
      reps: this._reps,
      lapses: this._lapses,
      left: this._left,
      odue: this._odue,
      odid: this._odid,
      flags: this._flags,
      data: this._data,
    })
  }

  save() {
    if (this.id) {
      return this._add()
    }

    return wankidb.cards.put(this)
  }

  get mid() {
    return this._mid
  }

  /***
   * the epoch milliseconds of when the card was created
   * @returns {number}
   */
  get id() {
    return this._id
  }

  /***
   * notes.id
   * @returns {number}
   */
  get nid() {
    return this._nid
  }

  /***
   * deck id (available in col table)
   * @returns {number}
   */
  get did() {
    return this._did
  }

  /***
   * ordinal : identifies which of the card templates or cloze deletions it corresponds to
   *  for card templates, valid values are from 0 to num templates - 1
   *  for cloze deletions, valid values are from 0 to max cloze index - 1 (they're 0 indexed despite the first being called `c1`)
   * @returns {number}
   */
  get ord() {
    return this._ord
  }

  /***
   * modificaton time as epoch seconds
   * @returns {number}
   */
  get mod() {
    return this._mod
  }

  /***
   * update sequence number : used to figure out diffs when syncing.
   *  value of -1 indicates changes that need to be pushed to server.
   *  usn < server usn indicates changes that need to be pulled from server.
   * @returns {number}
   */
  get usn() {
    return this._usn
  }

  /***
   * 0=new, 1=learning, 2=review, 3=relearning
   * @returns {number}
   */
  get type() {
    return this._type
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
  get queue() {
    return this._queue
  }

  /***
   * Due is used differently for different card types:
   *  new: note id or random int
   *  due: integer day, relative to the collection's creation time
   *  learning: integer timestamp in second
   * @returns {number}
   */
  get due() {
    return this._due
  }

  /***
   * interval (used in SRS algorithm). Negative = seconds, positive = days
   * @returns {number}
   */
  get ivl() {
    return this._ivl
  }

  /***
   * The ease factor of the card in permille (parts per thousand). If the ease factor is 2500, the card’s interval will be multiplied by 2.5 the next time you press Good.
   * @returns {number}
   */
  get factor() {
    return this._factor
  }

  /***
   * number of reviews
   * @returns {number}
   */
  get reps() {
    return this._reps
  }

  /***
   * the number of times the card went from a "was answered correctly"
   *  to "was answered incorrectly" state
   * @returns {number}
   */
  get lapses() {
    return this._lapses
  }

  /***
   * of the form a*1000+b, with:
   *  b the number of reps left till graduation
   *  a the number of reps left today
   * @returns {number}
   */
  get left() {
    return this._left
  }

  /***
   * original due: In filtered decks, it's the original due date that the card had before moving to filtered.
   * If the card lapsed in scheduler1, then it's the value before the lapse. (This is used when switching to scheduler 2. At this time, cards in learning becomes due again, with their previous due date)
   * In any other case it's 0.
   * @returns {number}
   */
  get odue() {
    return this._odue
  }

  /***
   * original did: only used when the card is currently in filtered deck
   * @returns {number}
   */
  get odid() {
    return this._odid
  }

  /***
   * an integer. This integer mod 8 represents a "flag", which can be see in browser and while reviewing a note. Red 1, Orange 2, Green 3, Blue 4, no flag: 0. This integer divided by 8 represents currently nothing
   * @returns {number}
   */
  get flags() {
    return this._flags
  }

  /***
   * currently unused
   * @returns {string}
   */
  get data() {
    return this._data
  }

  set mid(value) {
    this._mid = value
    return this
  }

  set id(value) {
    this._id = value
    return this
  }

  set nid(value) {
    this._nid = value
    return this
  }

  set did(value) {
    this._did = value
    return this
  }

  set ord(value) {
    this._ord = value
    return this
  }

  set mod(value) {
    this._mod = value
    return this
  }

  set usn(value) {
    this._usn = value
    return this
  }

  set type(value) {
    this._type = value
    return this
  }

  set queue(value) {
    this._queue = value
    return this
  }

  set due(value) {
    this._due = value
    return this
  }

  set ivl(value) {
    this._ivl = value
    return this
  }

  set factor(value) {
    this._factor = value
    return this
  }

  set reps(value) {
    this._reps = value
    return this
  }

  set lapses(value) {
    this._lapses = value
    return this
  }

  set left(value) {
    this._left = value
    return this
  }

  set odue(value) {
    this._odue = value
    return this
  }

  set odid(value) {
    this._odid = value
    return this
  }

  set flags(value) {
    this._flags = value
    return this
  }

  set data(value) {
    this._data = value
    return this
  }
}

wankidb.cards.mapToClass(Card)
