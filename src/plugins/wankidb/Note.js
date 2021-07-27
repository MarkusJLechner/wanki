import { wankidb } from '@/plugins/wankidb/db.js'
import { BaseTable } from '@/plugins/wankidb/BaseTable.js'
wankidb.notes.hook('reading', (obj) => Object.assign(new Note(), obj))

/***
 * Notes contain the raw information that is formatted into a number of cards
 *  according to the models
 */
export class Note extends BaseTable {
  /***
   * epoch miliseconds of when the note was created
   * @returns {number}
   */
  id
  /***
   * globally unique id, almost certainly used for syncing
   * @returns {number}
   */
  guid
  /***
   * model id
   * @returns {number}
   */
  mid
  /***
   * modification timestamp, epoch seconds
   * @returns {number}
   */
  mod
  /***
   * update sequence number: for finding diffs when syncing.
   *   See the description in the cards table for more info
   * @returns {number}
   */
  usn
  /***
   * space-separated string of tags.
   *   includes space at the beginning and end, for LIKE "% tag %" queries
   * @returns {string}
   */
  tags
  /***
   * the values of the fields in this note. separated by 0x1f (31) character.
   * @returns {number}
   */
  flds
  /***
   * sort field: used for quick sorting and duplicate check. The sort field is an integer so that when users are sorting on a field that contains only numbers, they are sorted in numeric instead of lexical order. Text is stored in this integer field.
   * @returns {number}
   */
  sfld
  /***
   * field checksum used for duplicate check.
   *   integer representation of first 8 digits of sha1 hash of the first field
   * @returns {number}
   */
  csum
  /***
   * unused
   * @returns {number}
   */
  flags
  /***
   * unused
   * @returns {string}
   */
  data

  constructor(load) {
    super(
      'notes',
      [
        'id',
        'guid',
        'mid',
        'mod',
        'usn',
        'tags',
        'flds',
        'sfld',
        'csum',
        'flags',
        'data',
      ],
      load,
    )
  }

  addTag(tag) {
    this.tags = (this.tags + ` ${tag}`).trim()
  }

  get model() {
    return wankidb.models.get({ id: this.mid })
  }
}
