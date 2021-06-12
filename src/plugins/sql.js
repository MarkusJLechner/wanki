import initSqlJs from 'sql.js/dist/sql-asm.js'
import { idbDecks } from '@/plugins/idb.js'

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

export const initSqlDb = async (uint8Array) => {
  try {
    const sql = await initSqlJs()
    return new sql.Database(uint8Array)
  } catch (e) {
    console.error(e)
    throw new Error('Error while parsing database')
  }
}

export const sqlSelect = (database, query) => {
  const stmt = database.prepare(query)
  stmt.step()
  return stmt.getAsObject()
}
