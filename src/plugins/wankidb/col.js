import { wankidb } from '@/plugins/wankidb/db.js'

/***
 * col contains a single row that holds various information about the collection
 */
export class Col {
  constructor({ id } = {}) {
    if (id) {
      this.load(id)
    }
    this._id = new Date().getTime()
  }

  async load(id) {
    const entry = await wankidb.col.where('id').equals(id).first()

    this._id = entry.id
    this._crt = entry.crt
    this._mod = entry.mod
    this._scm = entry.scm
    this._ver = entry.ver
    this._dty = entry.dty
    this._usn = entry.usn
    this._ls = entry.ls
    this._conf = entry.conf
    this._models = entry.models
    this._decks = entry.decks
    this._dconf = entry.dconf
    this._tags = entry.tags
  }

  _add() {
    return wankidb.col.add({
      id: this._id,
      crt: this._crt,
      mod: this._mod,
      scm: this._scm,
      ver: this._ver,
      dty: this._dty,
      usn: this._usn,
      ls: this._ls,
      conf: this._conf,
      models: this._models,
      decks: this._decks,
      dconf: this._dconf,
      tags: this._tags,
    })
  }

  save() {
    if (this.id) {
      return this._add()
    }

    return wankidb.col.put(this)
  }

  /***
   * arbitrary number since there is only one row
   * @returns {number}
   */
  get id() {
    return this._id
  }

  /***
   * timestamp of the creation date in second. It's correct up to the day. For V1 scheduler, the hour corresponds to starting a new day. By default, new day is 4.
   * @returns {number}
   */
  get crt() {
    return this._crt
  }

  /***
   * last modified in milliseconds
   * @returns {number}
   */
  get mod() {
    return this._mod
  }

  /***
   * schema mod time: time when "schema" was modified.
   * @returns {number}
   */
  get scm() {
    return this._scm
  }

  /***
   * version
   * @returns {number}
   */
  get ver() {
    return this._ver
  }

  /***
   * dirty: unused, set to 0
   * @returns {number}
   */
  get dty() {
    return this._dty
  }

  /***
   * update sequence number: used for finding diffs when syncing.
   *   See usn in cards table for more details.
   * @returns {number}
   */
  get usn() {
    return this._usn
  }

  /***
   * "last sync time"
   * @returns {number}
   */
  get ls() {
    return this._ls
  }

  /***
   * json object containing configuration options that are synced. Described below in "configuration JSONObjects"
   * @returns {json}
   */
  get conf() {
    return this._conf
  }

  /***
   * json object of json object(s) representing the models (aka Note types)
   * keys of this object are strings containing integers: "creation time in epoch milliseconds" of the models
   * values of this object are other json objects of the form described below in "Models JSONObjects"
   * @returns {json}
   */
  get models() {
    Object.entries(this._models).forEach((key, value) => {
      console.log(this._models)
    })

    const models = {}
    Object.entries(this._models).forEach(([id, model]) => {
      models.id = {
        css: model.css,
        did: model.did,
        flds: model.flds,
        //  'JSONArray containing object for each field in the model as follows:',
        //  {
        //    font: model.font,
        //    media: model.media,
        //    name: model.name,
        //    ord: model.ord,
        //    rtl: model.rtl,
        //    size: model.size,
        //    sticky:
        //      'sticky fields retain the value that was last added when adding new notes',
        //  },
        //],
        id: model.id,
        latexPost: model.latexPost,
        latexPre: model.latexPre,
        mod: model.mod,
        name: model.name,
        req: model.req,
        sortf: model.sortf,
        tags: model.tags,
        tmpls: model.tmpls,
        //   'JSONArray containing object of CardTemplate for each card in model',
        //   {
        //     afmt: model.afmt,
        //     bafmt:
        //       'browser answer format:used for displaying answer in browser',
        //     bqfmt:
        //       'browser question format:used for displaying question in browser',
        //     did: model.did,
        //     name: model.name,
        //     ord: model.ord,
        //     qfmt: model.qfmt,
        //   },
        // ],
        type: model.type,
        usn: model.usn,
        vers: model.vers,
      }
    })

    return models

    const a = {
      'model id (epoch time in milliseconds)': {
        css: 'CSS, shared for all templates',
        did: 'Long specifying the id of the deck that cards are added to by default',
        flds: [
          'JSONArray containing object for each field in the model as follows:',
          {
            font: 'display font',
            media: 'array of media. appears to be unused',
            name: 'field name',
            ord: 'ordinal of the field - goes from 0 to num fields -1',
            rtl: 'boolean, right-to-left script',
            size: 'font size',
            sticky:
              'sticky fields retain the value that was last added when adding new notes',
          },
        ],
        id: 'model ID, matches notes.mid',
        latexPost:
          'String added to end of LaTeX expressions (usually \\end{document})',
        latexPre: 'preamble for LaTeX expressions',
        mod: 'modification time in seconds',
        name: 'model name',
        req: [
          'req is unused in modern clients. May exist for backwards compatibility.',
        ],
        sortf:
          'Integer specifying which field is used for sorting in the browser',
        tags: 'Anki saves the tags of the last added note to the current model, use an empty array []',
        tmpls: [
          'JSONArray containing object of CardTemplate for each card in model',
          {
            afmt: 'answer template string',
            bafmt:
              'browser answer format:used for displaying answer in browser',
            bqfmt:
              'browser question format:used for displaying question in browser',
            did: 'deck override (null by default)',
            name: 'template name',
            ord: 'template number, see flds',
            qfmt: 'question format string',
          },
        ],
        type: 'Integer specifying what type of model. 0 for standard, 1 for cloze',
        usn: 'usn: Update sequence number: used in same way as other usn vales in db',
        vers: 'Legacy version number (unused), use an empty array []',
      },
    }
    return this._models
  }

  /***
   * json object of json object(s) representing the deck(s)
   * keys of this object are strings containing integers: "deck creation time in epoch milliseconds" for most decks, "1" for the default deck
   * values of this object are other json objects of the form described below in "Decks JSONObjects"
   * @returns {json}
   */
  get decks() {
    return this._decks
  }

  /***
   * json object of json object(s) representing the options group(s) for decks
   * keys of this object are strings containing integers: "options group creation time in epoch milliseconds" for most groups, "1" for the default option group
   * values of this object are other json objects of the form described below in "DConf JSONObjects"
   * @returns {json}
   */
  get dconf() {
    return this._dconf
  }

  /***
   * a cache of tags used in the collection (This list is displayed in the browser. Potentially at other place)
   * @returns {string}
   */
  get tags() {
    return this._tags
  }

  set id(value) {
    this._id = value
    return this
  }

  set crt(value) {
    this._crt = value
    return this
  }

  set mod(value) {
    this._mod = value
    return this
  }

  set scm(value) {
    this._scm = value
    return this
  }

  set ver(value) {
    this._mod = value
    return this
  }

  set dty(value) {
    this._dty = value
    return this
  }

  set usn(value) {
    this._usn = value
    return this
  }

  set ls(value) {
    this._ls = value
    return this
  }

  set conf(value) {
    this._conf = value
    return this
  }

  set models(value) {
    this._models = value
    return this
  }

  set decks(value) {
    this._decks = value
    return this
  }

  set dconf(value) {
    this._dconf = value
    return this
  }

  set tags(value) {
    this._tags = value
    return this
  }
}

wankidb.col.mapToClass(Col)
