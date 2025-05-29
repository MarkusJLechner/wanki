import initSqlJs from 'sql.js/dist/sql-asm'
import { idbDecks } from '@/plugins/idb'

// Define types for SQL.js
interface SqlJsDatabase {
  export: () => Uint8Array
  prepare: (query: string, params?: unknown) => SqlJsStatement
}

interface SqlJsStatement {
  step: () => boolean
  getAsObject: () => Record<string, unknown>
  free: () => void
}

interface SqlJs {
  Database: new (data: Uint8Array) => SqlJsDatabase
}

const sqlDbCache: Record<string, SqlJsDatabase> = {}

export const sqlDbDeck = async (
  deckId: string | number,
): Promise<SqlJsDatabase> => {
  if (!sqlDbCache[deckId]) {
    const deck = await (await idbDecks).get(deckId)
    if (!deck.decompressedFile.collection) {
      console.error('Empty database, check the initialization!')
    }
    sqlDbCache[deckId] = await initSqlDb(deck.decompressedFile.collection)
  }

  return sqlDbCache[deckId]
}

export const exportSqlDb = async (
  deckId: string | number,
): Promise<Uint8Array> => {
  const db = await sqlDbDeck(deckId)
  return db.export()
}

export const initSqlDb = async (
  uint8Array: Uint8Array,
): Promise<SqlJsDatabase> => {
  try {
    const sql = (await initSqlJs()) as SqlJs
    return new sql.Database(uint8Array)
  } catch (e) {
    console.error(e)
    throw new Error('Error while parsing database')
  }
}

export const sqlPrepare = (
  database: SqlJsDatabase,
  query: string,
  params?: unknown,
): Record<string, unknown>[] => {
  const stmt = database.prepare(query, params)
  const objs: Record<string, unknown>[] = []
  while (stmt.step()) {
    objs.push(stmt.getAsObject())
  }
  stmt.free()
  return objs
}

export const sqlDeck = async (
  deckId: string | number,
  query: string,
  params?: unknown,
): Promise<Record<string, unknown>> => {
  const sqlDb = await sqlDbDeck(deckId)
  return sqlPrepare(sqlDb, query, params)[0]
}
