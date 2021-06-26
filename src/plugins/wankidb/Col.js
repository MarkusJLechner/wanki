import { BaseTable } from '@/plugins/wankidb/BaseTable.js'
import { wankidb } from '@/plugins/wankidb/db.js'
wankidb.col.hook('creating', (primKey, obj) => {
  const cast = (json) => (typeof json === 'string' ? JSON.parse(json) : json)
  obj.dconf = cast(obj.dconf)
  obj.conf = cast(obj.conf)
  obj.models = cast(obj.models)
  obj.decks = cast(obj.decks)
})

/***
 * col contains a single row that holds various information about the collection
 */
export class Col extends BaseTable {
  /***
   * arbitrary number since there is only one row
   * @returns {number}
   */
  id

  /***
   * timestamp of the creation date in second. It's correct up to the day. For V1 scheduler, the hour corresponds to starting a new day. By default, new day is 4.
   * @returns {number}
   */
  crt

  /***
   * last modified in milliseconds
   * @returns {number}
   */
  mod

  /***
   * schema mod time: time when "schema" was modified.
   * @returns {number}
   */
  scm

  /***
   * version
   * @returns {number}
   */
  ver

  /***
   * dirty: unused, set to 0
   * @returns {number}
   */
  dty

  /***
   * update sequence number: used for finding diffs when syncing.
   *   See usn in cards table for more details.
   * @returns {number}
   */
  usn

  /***
   * "last sync time"
   * @returns {number}
   */
  ls

  /***
   * json object containing configuration options that are synced. Described below in "configuration JSONObjects"
   * @returns {json}
   */
  conf

  /***
   * json object of json object(s) representing the models (aka Note types)
   * keys of this object are strings containing integers: "creation time in epoch milliseconds" of the models
   * values of this object are other json objects of the form described below in "Models JSONObjects"
   * @returns {json}
   */
  models

  /***
   * json object of json object(s) representing the deck(s)
   * keys of this object are strings containing integers: "deck creation time in epoch milliseconds" for most decks, "1" for the default deck
   * values of this object are other json objects of the form described below in "Decks JSONObjects"
   * @returns {json}
   */
  decks

  /***
   * json object of json object(s) representing the options group(s) for decks
   * keys of this object are strings containing integers: "options group creation time in epoch milliseconds" for most groups, "1" for the default option group
   * values of this object are other json objects of the form described below in "DConf JSONObjects"
   * @returns {json}
   */
  dconf

  /***
   * a cache of tags used in the collection (This list is displayed in the browser. Potentially at other place)
   * @returns {string}
   */
  tags

  constructor(load) {
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
