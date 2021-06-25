import { wankidb } from '@/plugins/wankidb/db.js'

/***
 * revlog is a review history; it has a row for every review you've ever done!
 */
export class Reflog {
  constructor({ id } = {}) {
    if (id) {
      this.load(id)
    }
    this.id = new Date().getTime()
  }

  async load(id) {
    const entry = await wankidb.revlog.where('id').equals(id).first()

    this.id = entry.id
    this.cid = entry.cid
    this.usn = entry.usn
    this.ease = entry.ease
    this.ivl = entry.ivl
    this.lastIvl = entry.lastIvl
    this.factor = entry.factor
    this.time = entry.time
    this.type = entry.type
  }

  #add() {
    return wankidb.revlog.add({
      id: this.id,
      cid: this.cid,
      usn: this.usn,
      ease: this.ease,
      ivl: this.ivl,
      lastIvl: this.lastIvl,
      factor: this.factor,
      time: this.time,
      type: this.type,
    })
  }

  save() {
    if (this.id) {
      return this.#add()
    }

    return wankidb.revlog.put(this)
  }

  /***
   * epoch-milliseconds timestamp of when you did the review
   * @returns {number}
   */
  get field_id() {
    return this.id
  }

  /***
   * cards.id
   * @returns {*}
   */
  get field_cid() {
    return this.cid
  }

  /***
   * update sequence number: for finding diffs when syncing.
   *   See the description in the cards table for more info
   * @returns {*}
   */
  get field_usn() {
    return this.usn
  }

  /***
   * which button you pushed to score your recall.
   * review:  1(wrong), 2(hard), 3(ok), 4(easy)
   * learn/relearn:   1(wrong), 2(ok), 3(easy)
   * @returns {*}
   */
  get field_ease() {
    return this.ease
  }

  /***
   * interval (i.e. as in the card table)
   * @returns {*}
   */
  get field_ivl() {
    return this.ivl
  }

  /***
   * last interval (i.e. the last value of ivl. Note that this value is not necessarily equal to the actual interval between this review and the preceding review)
   * @returns {*}
   */
  get field_lastIvl() {
    return this.lastIvl
  }

  /***
   * factor
   * @returns {*}
   */
  get field_factor() {
    return this.factor
  }

  /***
   * how many milliseconds your review took, up to 60000 (60s)
   * @returns {*}
   */
  get field_time() {
    return this.time
  }

  /***
   * 0=learn, 1=review, 2=relearn, 3=cram
   * @returns {*}
   */
  get field_type() {
    return this.type
  }
}

wankidb.revlog.mapToClass(Reflog)
