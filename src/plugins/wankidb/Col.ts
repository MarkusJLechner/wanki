import { BaseTable } from '@/plugins/wankidb/BaseTable'
import { wankidb } from '@/plugins/wankidb/db'
import {
  Configuration,
  DecksObject,
  DConfObject,
  ModelsObject,
} from '@/plugins/wankidb/types'

wankidb.col.hook('creating', (_, obj) => {
  const cast = (
    json: unknown,
  ): Configuration | ModelsObject | DecksObject | DConfObject =>
    (typeof json === 'string' ? JSON.parse(json) : json) as
      | Configuration
      | ModelsObject
      | DecksObject
      | DConfObject
  obj.conf = cast(obj.conf) as Configuration
  // obj.dconf = cast(obj.dconf) as DConfObject
  // obj.models = cast(obj.models) as ModelsObject
  // obj.decks = cast(obj.decks) as DecksObject
})

wankidb.col.hook('reading', (obj) => {
  const parse = (
    json: unknown,
  ): Configuration | ModelsObject | DecksObject | DConfObject =>
    (typeof json === 'string' ? JSON.parse(json) : json) as
      | Configuration
      | ModelsObject
      | DecksObject
      | DConfObject
  obj.conf = parse(obj.conf) as Configuration
  return Object.assign(new Col(), obj)
})

/***
 * col contains a single row that holds various information about the collection
 */
export class Col extends BaseTable {
  /***
   * arbitrary number since there is only one row
   */
  id?: number

  /***
   * timestamp of the creation date in second. It's correct up to the day. For V1 scheduler, the hour corresponds to starting a new day. By default, new day is 4.
   */
  crt?: number

  /***
   * last modified in milliseconds
   */
  mod?: number

  /***
   * schema mod time: time when "schema" was modified.
   */
  scm?: number

  /***
   * version
   */
  ver?: number

  /***
   * dirty: unused, set to 0
   */
  dty?: number

  /***
   * update sequence number: used for finding diffs when syncing.
   *   See usn in cards table for more details.
   */
  usn?: number

  /***
   * "last sync time"
   */
  ls?: number

  /***
   * JSON object containing configuration options that are synced.
   * Contains settings like curDeck, activeDecks, newSpread, collapseTime, timeLim, estTimes, dueCounts,
   * curModel, nextPos, sortType, sortBackwards, addToCur, dayLearnFirst, newBury, lastUnburied, activeCols.
   * See Configuration interface for details.
   */
  conf?: Configuration

  /***
   * JSON object of JSON object(s) representing the models (aka Note types).
   * Keys of this object are strings containing integers: "creation time in epoch milliseconds" of the models.
   * Values of this object are other JSON objects containing fields like css, did, flds, id, latexPost, latexPre,
   * mod, name, req, sortf, tags, tmpls, type, usn, vers.
   * See ModelsObject and Model interfaces for details.
   */
  models?: ModelsObject

  /***
   * JSON object of JSON object(s) representing the deck(s).
   * Keys of this object are strings containing integers: "deck creation time in epoch milliseconds" for most decks, "1" for the default deck.
   * Values of this object are other JSON objects containing fields like name, extendRev, usn, collapsed, browserCollapsed,
   * newToday, revToday, lrnToday, timeToday, dyn, extendNew, conf, id, mod, desc.
   * See DecksObject and Deck interfaces for details.
   */
  decks?: DecksObject

  /***
   * JSON object of JSON object(s) representing the options group(s) for decks.
   * Keys of this object are strings containing integers: "options group creation time in epoch milliseconds" for most groups, "1" for the default option group.
   * Values of this object are other JSON objects containing fields like autoplay, dyn, id, lapse, leechAction,
   * maxTaken, mod, name, new, replayq, rev, timer, usn.
   * See DConfObject and DConf interfaces for details.
   */
  dconf?: DConfObject

  /***
   * a cache of tags used in the collection (This list is displayed in the browser. Potentially at other place)
   */
  tags?: string

  constructor(load?: Record<string, unknown>) {
    super(
      'col',
      [
        'id',
        'crt',
        'mod',
        'scm',
        'ver',
        'dty',
        'usn',
        'ls',
        'conf',
        'models',
        'decks',
        'dconf',
        'tags',
      ],
      load,
    )
  }
}
