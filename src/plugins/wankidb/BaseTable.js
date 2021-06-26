import { wankidb } from '@/plugins/wankidb/db.js'

export class BaseTable {
  idKey
  tableName
  tableColumns

  constructor(idKey, tableName, tableColumns, load) {
    this.idKey = idKey
    this.tableName = tableName
    this.tableColumns = tableColumns
    if (load) {
      this.load(load).then((obj) => console.log('loaded card', obj))
    }
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

  #add() {
    wankidb[this.tableName].add(this)
    return this
  }

  save() {
    if (!this[this.idKey]) {
      return this.#add()
    }
    wankidb[this.tableName].put(this)
    return this
  }
}
