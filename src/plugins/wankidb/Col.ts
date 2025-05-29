import { BaseTable } from '@/plugins/wankidb/BaseTable'
import { wankidb } from '@/plugins/wankidb/db'

wankidb.col.hook('creating', (primKey, obj) => {
  const cast = (json: unknown): Record<string, unknown> | unknown =>
    typeof json === 'string' ? JSON.parse(json) : json
  obj.conf = cast(obj.conf)
  // obj.dconf = cast(obj.dconf)
  // obj.models = cast(obj.models)
  // obj.decks = cast(obj.decks)
})

wankidb.col.hook('reading', (obj) => {
  const parse = (json: unknown): Record<string, unknown> | unknown =>
    typeof json === 'string' ? JSON.parse(json) : json
  obj.conf = parse(obj.conf)
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
   * json object containing configuration options that are synced. Described below in "configuration JSONObjects"
   */
  conf?: Record<string, unknown>

  /***
   * json object of json object(s) representing the models (aka Note types)
   * keys of this object are strings containing integers: "creation time in epoch milliseconds" of the models
   * values of this object are other json objects of the form described below in "Models JSONObjects"
   */
  models?: Record<string, unknown>

  /***
   * json object of json object(s) representing the deck(s)
   * keys of this object are strings containing integers: "deck creation time in epoch milliseconds" for most decks, "1" for the default deck
   * values of this object are other json objects of the form described below in "Decks JSONObjects"
   */
  decks?: Record<string, unknown>

  /***
   * json object of json object(s) representing the options group(s) for decks
   * keys of this object are strings containing integers: "options group creation time in epoch milliseconds" for most groups, "1" for the default option group
   * values of this object are other json objects of the form described below in "DConf JSONObjects"
   */
  dconf?: Record<string, unknown>

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
