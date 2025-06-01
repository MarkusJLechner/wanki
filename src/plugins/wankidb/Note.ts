import { wankidb } from '@/plugins/wankidb/db'
import { BaseTable } from '@/plugins/wankidb/BaseTable'

// Import the Model interface from Card.ts
import { type Model } from './Card'

wankidb.notes.hook('reading', (obj) => Object.assign(new Note(), obj))

/***
 * Notes contain the raw information that is formatted into a number of cards
 *  according to the models
 */
export class Note extends BaseTable {
  /***
   * epoch miliseconds of when the note was created
   */
  id?: number

  /***
   * globally unique id, almost certainly used for syncing
   */
  guid?: string

  /***
   * model id
   */
  mid?: number

  /***
   * modification timestamp, epoch seconds
   */
  mod?: number

  /***
   * update sequence number: for finding diffs when syncing.
   *   See the description in the cards table for more info
   */
  usn?: number

  /***
   * space-separated string of tags.
   *   includes space at the beginning and end, for LIKE "% tag %" queries
   */
  tags?: string

  /***
   * the values of the fields in this note. separated by 0x1f (31) character.
   */
  flds?: string

  /***
   * sort field: used for quick sorting and duplicate check. The sort field is an integer so that when users are sorting on a field that contains only numbers, they are sorted in numeric instead of lexical order. Text is stored in this integer field.
   */
  sfld?: string

  /***
   * field checksum used for duplicate check.
   *   integer representation of first 8 digits of sha1 hash of the first field
   */
  csum?: number

  /***
   * unused
   */
  flags?: number

  /***
   * unused
   */
  data?: string

  constructor(load?: Record<string, unknown>) {
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

  addTag(tag: string): void {
    if (this.tags === undefined) {
      this.tags = ''
    }
    this.tags = (this.tags + ` ${tag}`).trim()
  }

  get model(): Promise<Model> {
    return (async () => {
      let model = (await wankidb.models.get({
        id: this.mid,
      })) as unknown as Model
      if (!model) {
        model = (await wankidb.models.get({
          id: '' + this.mid,
        })) as unknown as Model
      }
      return model
    })()
  }
}
