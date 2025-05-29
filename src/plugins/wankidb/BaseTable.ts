// https://github.com/ankidroid/Anki-Android/wiki/Database-Structure

import { Database, wankidb } from '@/plugins/wankidb/db'

export class BaseTable<COLUMNS extends string[] = string[]> {
  tableName: Database
  tableColumns: COLUMNS
  loadPromise?: Promise<BaseTable<COLUMNS>>

  constructor(
    tableName: Database,
    tableColumns: COLUMNS,
    load?: Record<string, unknown>,
  ) {
    this.tableName = tableName
    this.tableColumns = tableColumns
    if (load) {
      this.loadPromise = this.load(load)
    }

    return this
  }

  async load(get: Record<string, unknown>): Promise<BaseTable<COLUMNS>> {
    if (!this.tableName) {
      throw new Error('No table name defined')
    }
    const entry = await wankidb[this.tableName].get(get)
    if (!entry) {
      throw new Error('Entry not found')
    }

    this.tableColumns.forEach((name) => {
      ;(this as Record<string, unknown>)[name] = entry[name]
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

  async save(): Promise<BaseTable<COLUMNS>> {
    await wankidb[this.tableName].put(this.getObj())
    return this
  }
}
