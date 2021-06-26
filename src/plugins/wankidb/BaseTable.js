import { wankidb } from '@/plugins/wankidb/db.js'

export class BaseTable {
  tableName
  tableColumns
  loadPromise

  constructor(tableName, tableColumns, load) {
    this.tableName = tableName
    this.tableColumns = tableColumns
    if (load) {
      this.loadPromise = this.load(load)
    }

    return this
  }

  async load(get) {
    if (!this.tableName) {
      throw new Error('No table name defined')
    }
    const entry = await wankidb[this.tableName].get(get)

    this.tableColumns.forEach((name) => {
      this[name] = entry[name]
    })
    return this
  }

  getObj() {
    return this.tableColumns.reduce((acc, curr) => {
      acc[curr] = this[curr]
      return acc
    }, {})
  }

  save() {
    wankidb[this.tableName].put(this.getObj())
    return this
  }
}
