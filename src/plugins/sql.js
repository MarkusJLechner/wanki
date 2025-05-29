import initSqlJs from 'sql.js/dist/sql-asm'
import { idbDecks, tableColJsonParse } from '@/plugins/idb'

const sqlDbCache = {}

export const sqlDbDeck = async (deckId) => {
  if (!sqlDbCache[deckId]) {
    const deck = await (await idbDecks).get(deckId)
    if (!deck.decompressedFile.collection) {
      console.error('Empty database, check the initialization!')
    }
    sqlDbCache[deckId] = await initSqlDb(deck.decompressedFile.collection)
  }

  return sqlDbCache[deckId]
}

export const exportSqlDb = async (deckId) => {
  const db = await sqlDbDeck(deckId)
  return db.export()
}

export const initSqlDb = async (uint8Array) => {
  try {
    const sql = await initSqlJs()
    return new sql.Database(uint8Array)
  } catch (e) {
    console.error(e)
    throw new Error('Error while parsing database')
  }
}

export const sqlPrepare = (database, query, params) => {
  const stmt = database.prepare(query, params)
  const objs = []
  while (stmt.step()) {
    objs.push(stmt.getAsObject())
  }
  stmt.free()
  return objs
}

export const sqlDeck = async (deckId, query, params) => {
  const sqlDb = await sqlDbDeck(deckId)
  return sqlPrepare(sqlDb, query, params)[0]
}
