import { openDB } from 'idb/with-async-ittr.js'
import {
  exportSqlDb,
  initSqlDb,
  sqlDbDeck,
  sqlDeck,
  sqlPrepare,
} from '@/plugins/sql.js'
import { wankidb } from '@/plugins/wankidb/db.js'

export const persist = () => {
  return navigator.storage.persist().then(function (persistent) {
    if (persistent) {
      console.log('Storage will not be cleared except by explicit user action')
    } else {
      console.log('Storage may be cleared by the UA under storage pressure.')
    }
  })
}

export const quotaPercent = async () => {
  const quota = await navigator.storage.estimate()
  return ((quota.usage / quota.quota) * 100).toFixed(2)
}

export const quotaRemain = async () => {
  const quota = await navigator.storage.estimate()
  return quota.quota - quota.usage
}

export const information = () => {
  return navigator.storage.estimate()
}

export const dbName = 'wanki'

export const idb = (() => {
  const defaultStore = async (dbName, storeName, updateEvent) => {
    const dbPromise = await openDB(dbName, 1, {
      upgrade(db, oldVersion, newVersion) {
        const store = db.createObjectStore(storeName, { autoIncrement: true })
        store.createIndex('index', 'index', { unique: true })
      },
    })

    function callUpdate() {
      if (typeof updateEvent === 'function') {
        return updateEvent()
      }

      if (typeof updateEvent === 'object' && updateEvent.length !== undefined) {
        updateEvent.forEach((event) => {
          document.dispatchEvent(new Event(event))
        })
      }
    }

    async function get(key) {
      return dbPromise.get(storeName, '' + key)
    }
    async function set(key, val) {
      const result = await dbPromise.put(storeName, val, '' + key)
      callUpdate()
      return result
    }
    async function update(key, updateFn) {
      const result = await get(key)
      return await set(key, updateFn(result))
    }
    async function del(key) {
      const result = await dbPromise.delete(storeName, '' + key)
      callUpdate()
      return result
    }
    async function clear() {
      const result = await dbPromise.clear(storeName)
      callUpdate()
      return result
    }
    async function keys() {
      return dbPromise.getAllKeys(storeName)
    }
    async function all() {
      return dbPromise.getAll(storeName)
    }
    async function close() {
      return dbPromise.close()
    }

    return {
      get,
      set,
      del,
      update,
      all,
      clear,
      keys,
      close,
    }
  }

  return {
    defaultStore,
  }
})()

export const idbDecks = idb.defaultStore(dbName, 'decks', [
  'page/overview/update',
  'indexeddb/decks/update',
])

export const importDeck = async (decompressedFile) => {
  const sqlDb = await initSqlDb(decompressedFile.collection)

  const cards = sqlPrepare(sqlDb, 'select * from cards')
  const col = sqlPrepare(sqlDb, 'select * from col')
  const graves = sqlPrepare(sqlDb, 'select * from graves')
  const notes = sqlPrepare(sqlDb, 'select * from notes')
  const revlog = sqlPrepare(sqlDb, 'select * from revlog')

  wankidb.cards.bulkAdd(cards)
  wankidb.col.bulkAdd(col)
  wankidb.notes.bulkAdd(notes)
  wankidb.graves.bulkAdd(graves)
  wankidb.revlog.bulkAdd(revlog)

  console.log(decompressedFile)
  console.log({ cards })

  const tableCol = tableColJsonParse(
    sqlPrepare(sqlDb, 'select * from col limit 1')[0],
  )

  const [deckId, deckName] = Object.entries(tableCol.decks).filter(
    (entry) => entry[1].name !== 'Default',
  )[0]

  const deck = await idbDecks
  await deck.set(deckId, {
    id: deckId,
    name: deckName.name,
    tables: {
      col: tableCol,
    },
    decompressedFile: { ...decompressedFile },
  })
}

export const tableColJsonParse = (tableCol) => {
  tableCol.conf = JSON.parse(tableCol.conf)
  tableCol.models = JSON.parse(tableCol.models)
  tableCol.decks = JSON.parse(tableCol.decks)
  tableCol.dconf = JSON.parse(tableCol.dconf)
  tableCol.tags = JSON.parse(tableCol.tags)
  return tableCol
}

export const updateDeckParsed = async (deckId) => {
  const tableCol = tableColJsonParse(
    await sqlDeck(deckId, 'select * from col limit 1'),
  )

  await (
    await idbDecks
  ).update(deckId, (result) => {
    result.tables.col = tableCol
    return result
  })
}

export const saveDirtySql = async (deckId) => {
  const uint8Array = await exportSqlDb(deckId)

  await (
    await idbDecks
  ).update(deckId, (result) => {
    result.decompressedFile.collection = uint8Array
    return result
  })
}
