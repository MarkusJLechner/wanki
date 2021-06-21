import { wankidb } from '@/plugins/wankidb/db.js'

/***
 * revlog is a review history; it has a row for every review you've ever done!
 */
export class Reflog {
  constructor({ id } = {}) {
    if (id) {
      this.load(id)
    }
    this._id = new Date().getTime()
  }

  async load(id) {
    const entry = await wankidb.revlog.where('id').equals(id).first()

    this._id = entry.id
    this._cid = entry.cid
    this._usn = entry.usn
    this._ease = entry.ease
    this._ivl = entry.ivl
    this._lastIvl = entry.lastIvl
    this._factor = entry.factor
    this._time = entry.time
    this._type = entry.type
  }

  _add() {
    return wankidb.revlog.add({
      id: this._id,
      cid: this._cid,
      usn: this._usn,
      ease: this._ease,
      ivl: this._ivl,
      lastIvl: this._lastIvl,
      factor: this._factor,
      time: this._time,
      type: this._type,
    })
  }

  save() {
    if (this._id) {
      return this._add()
    }

    return wankidb.revlog.put(this)
  }

  /***
   * epoch-milliseconds timestamp of when you did the review
   * @returns {number}
   */
  get id() {
    return this._id
  }

  /***
   * cards.id
   * @returns {*}
   */
  get cid() {
    return this._cid
  }

  /***
   * update sequence number: for finding diffs when syncing.
   *   See the description in the cards table for more info
   * @returns {*}
   */
  get usn() {
    return this._usn
  }

  /***
   * which button you pushed to score your recall.
   * review:  1(wrong), 2(hard), 3(ok), 4(easy)
   * learn/relearn:   1(wrong), 2(ok), 3(easy)
   * @returns {*}
   */
  get ease() {
    return this._ease
  }

  /***
   * interval (i.e. as in the card table)
   * @returns {*}
   */
  get ivl() {
    return this._ivl
  }

  /***
   * last interval (i.e. the last value of ivl. Note that this value is not necessarily equal to the actual interval between this review and the preceding review)
   * @returns {*}
   */
  get lastIvl() {
    return this._lastIvl
  }

  /***
   * factor
   * @returns {*}
   */
  get factor() {
    return this._factor
  }

  /***
   * how many milliseconds your review took, up to 60000 (60s)
   * @returns {*}
   */
  get time() {
    return this._time
  }

  /***
   * 0=learn, 1=review, 2=relearn, 3=cram
   * @returns {*}
   */
  get type() {
    return this._type
  }

  set id(value) {
    this._id = value
  }

  set cid(value) {
    this._cid = value
  }

  set usn(value) {
    this._usn = value
  }

  set ease(value) {
    this._ease = value
  }

  set ivl(value) {
    this._ivl = value
  }

  set lastIvl(value) {
    this._lastIvl = value
  }

  set factor(value) {
    this._factor = value
  }

  set time(value) {
    this._time = value
  }

  set type(value) {
    this._type = value
  }
}

wankidb.revlog.mapToClass(Reflog)
