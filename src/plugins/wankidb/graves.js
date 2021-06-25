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

    this.usn = entry.usn
    this.oid = entry.oid
    this.type = entry.type
  }

  #add() {
    return wankidb.graves.add({
      usn: this.usn,
      oid: this.oid,
      type: this.type,
    })
  }

  save() {
    if (this.oid) {
      return this.#add()
    }

    return wankidb.graves.put(this)
  }

  /***
   * usn should be set to -1,
   * @returns {number}
   */
  get field_usn() {
    return this.usn
  }

  /***
   * oid is the original id.
   * @returns {number}
   */
  get field_oid() {
    return this.oid
  }

  /***
   * type: 0 for a card, 1 for a note and 2 for a deck
   * @returns {number}
   */
  get field_type() {
    return this.type
  }
}

wankidb.graves.mapToClass(Grave)
