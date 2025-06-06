import { BaseTable } from '@/plugins/wankidb/BaseTable'
import { wankidb } from '@/plugins/wankidb/db'

wankidb.decks.hook('reading', (obj) => Object.assign(new Deck(), obj))

/***
 * col contains a single row that holds various information about the collection
 */
export class Deck extends BaseTable {
  /***
   * "name of deck",
   */
  name?: string

  /***
   * "extended review card limit (for custom study)
   * Potentially absent, in this case it's considered to be 10 by aqt.customstudy",
   */
  extendRev?: number

  /***
   * "usn: Update sequence number: used in same way as other usn vales in db",
   */
  usn?: number

  /***
   * "true when deck is collapsed",
   */
  collapsed?: boolean

  /***
   * "true when deck collapsed in browser",
   */
  browserCollapsed?: boolean

  /***
   * two number array.
   * First one is the number of days that have passed between the collection was created and the deck was last updated
   * The second one is equal to the number of cards seen today in this deck minus the number of new cards in custom study today.
   * BEWARE, it's changed in anki.sched(v2).Scheduler._updateStats and anki.sched(v2).Scheduler._updateCutoff.update  but can't be found by grepping 'newToday', because it's instead written as type+"Today" with type which may be new/rev/lrnToday
   */
  newToday?: [number, number]
  revToday?: [number, number]
  lrnToday?: [number, number]

  /***
   *
   */
  timeToday?: [number, number]

  /***
   * "1 if dynamic (AKA filtered) deck",
   */
  dyn?: number

  /***
   * "extended new card limit (for custom study).
   * Potentially absent, in this case it's considered to be 10 by aqt.customstudy",
   */
  extendNew?: number

  /***
   * "id of option group from dconf in `col` table. Or absent if the deck is dynamic.
   * Its absent in filtered deck",
   */
  conf?: number

  /***
   * "deck ID (automatically generated long)",
   */
  id?: number

  /***
   * "last modification time",
   */
  mod?: number

  /***
   * "deck description"
   */
  desc?: string

  constructor(load?: Record<string, unknown>) {
    super(
      'decks',
      [
        'name',
        'extendRev',
        'usn',
        'collapsed',
        'browserCollapsed',
        'newToday',
        'revToday',
        'lrnToday',
        'timeToday',
        'dyn',
        'extendNew',
        'conf',
        'id',
        'mod',
        'desc',
      ],
      load,
    )
  }
}
