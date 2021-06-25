import { wankidb } from '@/plugins/wankidb/db.js'

/***
 * col contains a single row that holds various information about the collection
 */
export class Col {
  constructor({ id } = {}) {
    if (id) {
      this.load(id)
    }
    this.id = new Date().getTime()
  }

  async load(id) {
    const entry = await wankidb.col.where('id').equals(id).first()

    this.id = entry.id
    this.crt = entry.crt
    this.mod = entry.mod
    this.scm = entry.scm
    this.ver = entry.ver
    this.dty = entry.dty
    this.usn = entry.usn
    this.ls = entry.ls
    this.conf = entry.conf
    this.models = entry.models
    this.decks = entry.decks
    this.dconf = entry.dconf
    this.tags = entry.tags
  }

  #add() {
    return wankidb.col.add({
      id: this.id,
      crt: this.crt,
      mod: this.mod,
      scm: this.scm,
      ver: this.ver,
      dty: this.dty,
      usn: this.usn,
      ls: this.ls,
      conf: this.conf,
      models: this.models,
      decks: this.decks,
      dconf: this.dconf,
      tags: this.tags,
    })
  }

  save() {
    if (this.id) {
      return this.#add()
    }

    return wankidb.col.put(this)
  }

  /***
   * arbitrary number since there is only one row
   * @returns {number}
   */
  get field_id() {
    return this.id
  }

  /***
   * timestamp of the creation date in second. It's correct up to the day. For V1 scheduler, the hour corresponds to starting a new day. By default, new day is 4.
   * @returns {number}
   */
  get field_crt() {
    return this.crt
  }

  /***
   * last modified in milliseconds
   * @returns {number}
   */
  get field_mod() {
    return this.mod
  }

  /***
   * schema mod time: time when "schema" was modified.
   * @returns {number}
   */
  get field_scm() {
    return this.scm
  }

  /***
   * version
   * @returns {number}
   */
  get field_ver() {
    return this.ver
  }

  /***
   * dirty: unused, set to 0
   * @returns {number}
   */
  get field_dty() {
    return this.dty
  }

  /***
   * update sequence number: used for finding diffs when syncing.
   *   See usn in cards table for more details.
   * @returns {number}
   */
  get field_usn() {
    return this.usn
  }

  /***
   * "last sync time"
   * @returns {number}
   */
  get field_ls() {
    return this.ls
  }

  /***
   * json object containing configuration options that are synced. Described below in "configuration JSONObjects"
   * @returns {json}
   */
  get field_conf() {
    return this.conf
  }

  /***
   * json object of json object(s) representing the models (aka Note types)
   * keys of this object are strings containing integers: "creation time in epoch milliseconds" of the models
   * values of this object are other json objects of the form described below in "Models JSONObjects"
   * @returns {json}
   */
  get field_models() {
    return this.models
  }

  /***
   * json object of json object(s) representing the deck(s)
   * keys of this object are strings containing integers: "deck creation time in epoch milliseconds" for most decks, "1" for the default deck
   * values of this object are other json objects of the form described below in "Decks JSONObjects"
   * @returns {json}
   */
  get field_decks() {
    return this.decks
  }

  /***
   * json object of json object(s) representing the options group(s) for decks
   * keys of this object are strings containing integers: "options group creation time in epoch milliseconds" for most groups, "1" for the default option group
   * values of this object are other json objects of the form described below in "DConf JSONObjects"
   * @returns {json}
   */
  get field_dconf() {
    return this.dconf
  }

  /***
   * a cache of tags used in the collection (This list is displayed in the browser. Potentially at other place)
   * @returns {string}
   */
  get field_tags() {
    return this.tags
  }
}

wankidb.col.mapToClass(Col)
