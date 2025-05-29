import { BaseTable } from '@/plugins/wankidb/BaseTable'
import { wankidb } from '@/plugins/wankidb/db'

wankidb.graves.hook('reading', (obj) => Object.assign(new Grave(), obj))

/***
 * Contains deleted cards, notes, and decks that need to be synced.
 */
export class Grave extends BaseTable {
  /***
   * usn should be set to -1,
   */
  usn?: number

  /***
   * oid is the original id.
   */
  oid?: number

  /***
   * type: 0 for a card, 1 for a note and 2 for a deck
   */
  type?: number

  constructor(load?: Record<string, unknown>) {
    super('graves', ['usn', 'oid', 'type'], load)
  }
}
