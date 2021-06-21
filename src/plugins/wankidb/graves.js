import { wankidb } from '@/plugins/wankidb/db.js'

/***
 * Contains deleted cards, notes, and decks that need to be synced.
 */
export class Grave {
  constructor({ oid } = {}) {
    if (oid) {
      this.load(oid)
    }
  }

  async load(oid) {
    const entry = await wankidb.graves.where('oid').equals(oid).first()

    this._usn = entry.usn
    this._oid = entry.oid
    this._type = entry.type
  }

  _add() {
    return wankidb.graves.add({
      usn: this._usn,
      oid: this._oid,
      type: this._type,
    })
  }

  save() {
    if (this.oid) {
      return this._add()
    }

    return wankidb.graves.put(this)
  }

  /***
   * usn should be set to -1,
   * @returns {number}
   */
  get usn() {
    return this._usn
  }

  /***
   * oid is the original id.
   * @returns {number}
   */
  get oid() {
    return this._oid
  }

  /***
   * type: 0 for a card, 1 for a note and 2 for a deck
   * @returns {number}
   */
  get type() {
    return this._type
  }

  set usn(value) {
    this._usn = value
    return this
  }

  set oid(value) {
    this._oid = value
    return this
  }

  set type(value) {
    this._type = value
    return this
  }
}

wankidb.graves.mapToClass(Grave)
