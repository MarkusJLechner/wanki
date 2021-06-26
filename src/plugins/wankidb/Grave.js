import { BaseTable } from '@/plugins/wankidb/BaseTable.js'
import { wankidb } from '@/plugins/wankidb/db.js'
wankidb.graves.hook('reading', (obj) => Object.assign(new Grave(), obj))

/***
 * Contains deleted cards, notes, and decks that need to be synced.
 */
export class Grave extends BaseTable {
  /***
   * usn should be set to -1,
   * @returns {number}
   */
  usn
  /***
   * oid is the original id.
   * @returns {number}
   */
  oid
  /***
   * type: 0 for a card, 1 for a note and 2 for a deck
   * @returns {number}
   */
  type

  constructor(load) {
    super('graves', ['usn', 'oid', 'type'], load)
  }
}
