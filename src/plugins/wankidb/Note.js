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
    this.id = new Date().getTime()
  }

  async load(id) {
    const entry = await wankidb.notes.where('id').equals(id).first()

    this.id = entry.id
    this.guid = entry.guid
    this.mid = entry.mid
    this.mod = entry.mod
    this.usn = entry.usn
    this.tags = entry.tags
    this.flds = entry.flds
    this.sfld = entry.sfld
    this.csum = entry.csum
    this.flags = entry.flags
    this.data = entry.data
  }

  #add() {
    return wankidb.notes.add({
      id: this.id,
      guid: this.guid,
      mid: this.mid,
      mod: this.mod,
      usn: this.usn,
      tags: this.tags,
      flds: this.flds,
      sfld: this.sfld,
      csum: this.csum,
      flags: this.flags,
      data: this.data,
    })
  }

  save() {
    if (this.id) {
      return this.#add()
    }

    return wankidb.notes.put(this)
  }

  /***
   * epoch miliseconds of when the note was created
   * @returns {number}
   */
  get field_id() {
    return this.id
  }

  /***
   * globally unique id, almost certainly used for syncing
   * @returns {number}
   */
  get field_guid() {
    return this.guid
  }

  /***
   * model id
   * @returns {number}
   */
  get field_mid() {
    return this.mid
  }

  /***
   * modification timestamp, epoch seconds
   * @returns {number}
   */
  get field_mod() {
    return this.mod
  }

  /***
   * update sequence number: for finding diffs when syncing.
   *   See the description in the cards table for more info
   * @returns {number}
   */
  get field_usn() {
    return this.usn
  }

  /***
   * space-separated string of tags.
   *   includes space at the beginning and end, for LIKE "% tag %" queries
   * @returns {string}
   */
  get field_tags() {
    return this.tags
  }

  /***
   * the values of the fields in this note. separated by 0x1f (31) character.
   * @returns {number}
   */
  get field_flds() {
    return this.flds
  }

  /***
   * sort field: used for quick sorting and duplicate check. The sort field is an integer so that when users are sorting on a field that contains only numbers, they are sorted in numeric instead of lexical order. Text is stored in this integer field.
   * @returns {number}
   */
  get field_sfld() {
    return this.sfld
  }

  /***
   * field checksum used for duplicate check.
   *   integer representation of first 8 digits of sha1 hash of the first field
   * @returns {number}
   */
  get field_csum() {
    return this.csum
  }

  /***
   * unused
   * @returns {number}
   */
  get field_flags() {
    return this.flags
  }

  /***
   * unused
   * @returns {string}
   */
  get field_data() {
    return this.data
  }

  set id(value) {
    this.id = value
    return this
  }

  set guid(value) {
    this.guid = value
    return this
  }

  set mid(value) {
    this.mid = value
    return this
  }

  set mod(value) {
    this.mod = value
    return this
  }

  set usn(value) {
    this.usn = value
    return this
  }

  set tags(value) {
    this.tags = value
    return this
  }

  set flds(value) {
    this.flds = value
    return this
  }

  set sfld(value) {
    this.sfld = value
    return this
  }

  set csum(value) {
    this.csum = value
    return this
  }

  set flags(value) {
    this.flags = value
    return this
  }

  set data(value) {
    this.data = value
    return this
  }
}

wankidb.notes.mapToClass(Note)
