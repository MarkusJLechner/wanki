// https://github.com/ankidroid/Anki-Android/wiki/Database-Structure

import { wankidb } from '@/plugins/wankidb/db'

export class BaseTable {
  tableName: string
  tableColumns: string[]
  loadPromise?: Promise<BaseTable>

  constructor(
    tableName: string,
    tableColumns: string[],
    load?: Record<string, unknown>,
  ) {
    this.tableName = tableName
    this.tableColumns = tableColumns
    if (load) {
      this.loadPromise = this.load(load)
    }

    return this
  }

  async load(get: Record<string, unknown>): Promise<BaseTable> {
    if (!this.tableName) {
      throw new Error('No table name defined')
    }
    const entry = await wankidb[this.tableName].get(get)

    this.tableColumns.forEach((name) => {
      this[name as keyof this] = entry[name]
    })
    return this
  }

  getObj(): Record<string, unknown> {
    return this.tableColumns.reduce(
      (acc: Record<string, unknown>, curr: string) => {
        acc[curr] = this[curr as keyof this]
        return acc
      },
      {},
    )
  }

  async save(): Promise<BaseTable> {
    await wankidb[this.tableName].put(this.getObj())
    return this
  }
}
