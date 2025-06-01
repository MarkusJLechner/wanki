// https://github.com/ankidroid/Anki-Android/wiki/Database-Structure

import { type DatabaseNameType, wankidb } from '@/plugins/wankidb/db'

export class BaseTable<COLUMNS extends string[] = string[]> {
  tableName: DatabaseNameType
  tableColumns: COLUMNS
  loadPromise?: Promise<BaseTable<COLUMNS>>

  constructor(
    tableName: DatabaseNameType,
    tableColumns: COLUMNS,
    load?: Record<string, unknown>,
    throwOnNotFound = true,
  ) {
    this.tableName = tableName
    this.tableColumns = tableColumns
    if (load) {
      this.loadPromise = this.load(load, throwOnNotFound)
    }

    return this
  }

  async load(
    get: Record<string, unknown>,
    throwOnNotFound: boolean,
  ): Promise<BaseTable<COLUMNS>> {
    if (!this.tableName) {
      throw new Error('No table name defined')
    }
    const entry = await wankidb[this.tableName].get(get)
    if (!entry) {
      if (throwOnNotFound) {
        throw new Error('Entry not found')
      } else {
        return this
      }
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
