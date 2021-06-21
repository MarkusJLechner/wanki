import { wankidb } from '@/plugins/wankidb/db.js'

/***
 * Notes contain the raw information that is formatted into a number of cards
 *  according to the models
 */
export class Note {
  constructor({ id } = {}) {
    if (id) {
      this.load(id)
    }
    this._id = new Date().getTime()
  }

  async load(id) {
    const entry = await wankidb.notes.where('id').equals(id).first()

    this._id = entry.id
    this._guid = entry.guid
    this._mid = entry.mid
    this._mod = entry.mod
    this._usn = entry.usn
    this._tags = entry.tags
    this._flds = entry.flds
    this._sfld = entry.sfld
    this._csum = entry.csum
    this._flags = entry.flags
    this._data = entry.data
  }

  _add() {
    return wankidb.notes.add({
      id: this._id,
      guid: this._guid,
      mid: this._mid,
      mod: this._mod,
      usn: this._usn,
      tags: this._tags,
      flds: this._flds,
      sfld: this._sfld,
      csum: this._csum,
      flags: this._flags,
      data: this._data,
    })
  }

  save() {
    if (this._id) {
      return this._add()
    }

    return wankidb.notes.put(this)
  }

  /***
   * epoch miliseconds of when the note was created
   * @returns {number}
   */
  get id() {
    return this._id
  }

  /***
   * globally unique id, almost certainly used for syncing
   * @returns {number}
   */
  get guid() {
    return this._guid
  }

  /***
   * model id
   * @returns {number}
   */
  get mid() {
    return this._mid
  }

  /***
   * modification timestamp, epoch seconds
   * @returns {number}
   */
  get mod() {
    return this._mod
  }

  /***
   * update sequence number: for finding diffs when syncing.
   *   See the description in the cards table for more info
   * @returns {number}
   */
  get usn() {
    return this._usn
  }

  /***
   * space-separated string of tags.
   *   includes space at the beginning and end, for LIKE "% tag %" queries
   * @returns {string}
   */
  get tags() {
    return this._tags
  }

  /***
   * the values of the fields in this note. separated by 0x1f (31) character.
   * @returns {number}
   */
  get flds() {
    return this._flds
  }

  /***
   * sort field: used for quick sorting and duplicate check. The sort field is an integer so that when users are sorting on a field that contains only numbers, they are sorted in numeric instead of lexical order. Text is stored in this integer field.
   * @returns {number}
   */
  get sfld() {
    return this._sfld
  }

  /***
   * field checksum used for duplicate check.
   *   integer representation of first 8 digits of sha1 hash of the first field
   * @returns {number}
   */
  get csum() {
    return this._csum
  }

  /***
   * unused
   * @returns {number}
   */
  get flags() {
    return this._flags
  }

  /***
   * unused
   * @returns {string}
   */
  get data() {
    return this._data
  }

  set id(value) {
    this._id = value
    return this
  }

  set guid(value) {
    this._guid = value
    return this
  }

  set mid(value) {
    this._mid = value
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

  set tags(value) {
    this._tags = value
    return this
  }

  set flds(value) {
    this._flds = value
    return this
  }

  set sfld(value) {
    this._sfld = value
    return this
  }

  set csum(value) {
    this._csum = value
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

wankidb.notes.mapToClass(Note)
