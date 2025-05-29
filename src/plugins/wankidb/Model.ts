import { wankidb } from '@/plugins/wankidb/db'
import { BaseTable } from '@/plugins/wankidb/BaseTable'

// Define interfaces for related types
export interface ModelField {
  name?: string
  font?: string
  media?: string[]
  ord?: number
  rtl?: boolean
  size?: number
  sticky?: boolean
  [key: string]: unknown
}

export interface Template {
  afmt?: string
  bafmt?: string
  bqfmt?: string
  did?: number | null
  name?: string
  ord?: number
  qfmt?: string
  [key: string]: unknown
}

wankidb.models.hook('reading', (obj) => Object.assign(new Model(), obj))

export class Model extends BaseTable {
  /***
   * model ID, matches notes.mid
   */
  id?: number

  /***
   * Legacy version number (unused), use an empty array []
   */
  vers?: unknown[]

  /***
   * model name
   */
  name?: string

  /***
   * Anki saves the tags of the last added note to the current model, use an empty array []
   */
  tags?: string[]

  /***
   * deck id (available in col table)
   */
  did?: number

  /***
   * usn: Update sequence number: used in same way as other usn vales in db
   */
  usn?: number

  /***
   * req is unused in modern clients. May exist for backwards compatibility.
   */
  req?: Record<string, unknown>

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
  flds?: ModelField[]

  /***
   * Integer specifying which field is used for sorting in the browser
   */
  sortf?: number

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
  tmpls?: Template[]

  /***
   * modification time in seconds
   */
  mod?: number

  /***
   * String added to end of LaTeX expressions (usually \\end{document})
   */
  latexPost?: string

  /***
   * Integer specifying what type of model. 0 for standard, 1 for cloze
   */
  type?: number

  /***
   * CSS, shared for all templates
   */
  css?: string

  /***
   * preamble for LaTeX expressions
   */
  latexPre?: string

  constructor(load?: Record<string, unknown>) {
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
