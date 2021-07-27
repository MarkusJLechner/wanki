import { openDB } from 'idb/with-async-ittr.js'
import { exportSqlDb, initSqlDb, sqlDeck, sqlPrepare } from '@/plugins/sql.js'

import WorkerBulkPut from '@/plugins/workers/wankidbBulkPut.js?worker'
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

  const graves = sqlPrepare(sqlDb, 'select * from graves')
  const notes = sqlPrepare(sqlDb, 'select * from notes')
  const revlog = sqlPrepare(sqlDb, 'select * from revlog')
  const cards = sqlPrepare(sqlDb, 'select * from cards')
  const col = sqlPrepare(sqlDb, 'select * from col limit 1')

  const cast = (json) => (typeof json === 'string' ? JSON.parse(json) : json)
  const models = Object.values(cast(col[0].models) || {})
  const decks = Object.values(cast(col[0].decks) || {})
  const dconf = Object.values(cast(col[0].dconf) || {})
  const tags = Object.values(cast(col[0].tags) || {})

  delete col[0].models
  delete col[0].decks
  delete col[0].dconf
  delete col[0].tags

  const workerList = {}
  const workerPromises = []

  const work = ({ table, data }) => {
    workerPromises.push(
      new Promise((resolve, reject) => {
        // const worka = new WorkerBulkPut()

        ;(async () => {
          console.time('- ' + table)
          await wankidb.open()
          await wankidb[table]
            .bulkPut(data)
            .then(() => {
              workerList[table] = true
              resolve(workerList)
            })
            .catch((e) => {
              reject(e.message)
            })
            .finally(() => {
              console.timeEnd('- ' + table)
            })
        })()

        /*

        workerList[table] = false
        worka.onerror = function (e) {
          reject(e)
        }
        worka.postMessage({
          table,
          data,
        })
        worka.onmessage = function () {
          workerList[table] = true
          resolve(workerList)
        }

         */
      }),
    )
  }
  work({
    table: 'notes',
    data: notes,
  })
  work({
    table: 'graves',
    data: graves,
  })
  work({
    table: 'revlog',
    data: revlog,
  })
  work({
    table: 'models',
    data: models,
  })
  work({
    table: 'decks',
    data: decks,
  })
  work({
    table: 'dconf',
    data: dconf,
  })
  work({
    table: 'tags',
    data: tags,
  })
  work({
    table: 'media',
    data: decompressedFile.media,
  })
  work({
    table: 'cards',
    data: cards,
  })
  work({
    table: 'col',
    data: col,
  })

  return workerPromises
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
