import { wankidb } from '@/plugins/wankidb/db.js'
import { BaseTable } from '@/plugins/wankidb/BaseTable.js'
wankidb.models.hook('reading', (obj) => Object.assign(new Model(), obj))

export class Model extends BaseTable {
  /***
   * model ID, matches notes.mid
   */
  id
  /***
   * Legacy version number (unused), use an empty array []
   */
  vers
  /***
   * model name
   */
  name
  /***
   * Anki saves the tags of the last added note to the current model, use an empty array []
   */
  tags
  /***
   * deck id (available in col table)
   */
  did
  /***
   * usn: Update sequence number: used in same way as other usn vales in db
   */
  usn
  /***
   * req is unused in modern clients. May exist for backwards compatibility.
   */
  req
  /***
   * JSONArray containing object for each field in the model as follows:
   * {
   *   font : "display font",
   *   media : "array of media. appears to be unused",
   *   name : "field name",
   *   ord : "ordinal of the field - goes from 0 to num fields -1",
   *   rtl : "boolean, right-to-left script",
   *   size : "font size",
   *   sticky : "sticky fields retain the value that was last added when adding new notes"
   * }
   */
  flds
  /***
   * Integer specifying which field is used for sorting in the browser
   */
  sortf
  /***
   * JSONArray containing object of CardTemplate for each card in model
   * {
   *   afmt : "answer template string",
   *   bafmt : "browser answer format: used for displaying answer in browser",
   *   bqfmt : "browser question format: used for displaying question in browser",
   *   did : "deck override (null by default)",
   *   name : "template name",
   *   ord : "template number, see flds",
   *   qfmt : "question format string"
   * }
   */
  tmpls
  /***
   * modification time in seconds
   */
  mod
  /***
   * String added to end of LaTeX expressions (usually \\end{document})
   */
  latexPost
  /***
   * Integer specifying what type of model. 0 for standard, 1 for cloze
   */
  type
  /***
   * CSS, shared for all templates
   */
  css
  /***
   * preamble for LaTeX expressions
   */
  latexPre

  constructor(load) {
    super(
      'models',
      [
        'id',
        'vers',
        'name',
        'tags',
        'did',
        'usn',
        'req',
        'flds',
        'sortf',
        'tmpls',
        'mod',
        'latexPost',
        'type',
        'css',
        'latexPre',
      ],
      load,
    )
  }
}
