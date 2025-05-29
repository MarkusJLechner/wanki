import { openDB, DBSchema } from 'idb'
import { exportSqlDb, initSqlDb, sqlDeck, sqlPrepare } from '@/plugins/sql'

// import WorkerBulkPut from '@/plugins/workers/wankidbBulkPut.js?worker'
import { wankidb } from '@/plugins/wankidb/db'

// Define types for the store items
type UpdateEventCallback = () => void
type StoreValue = Record<string, unknown>
type UpdateFunction = (result: StoreValue) => StoreValue

export const persist = (): Promise<boolean> => {
  return navigator.storage.persist().then(function (persistent) {
    if (persistent) {
      console.log('Storage will not be cleared except by explicit user action')
    } else {
      console.log('Storage may be cleared by the UA under storage pressure.')
    }
    return persistent
  })
}

export const quotaPercent = async (): Promise<string> => {
  const quota = await navigator.storage.estimate()
  return ((quota.usage! / quota.quota!) * 100).toFixed(2)
}

export const quotaRemain = async (): Promise<number> => {
  const quota = await navigator.storage.estimate()
  return quota.quota! - quota.usage!
}

export const information = (): Promise<StorageEstimate> => {
  return navigator.storage.estimate()
}

export const dbName = 'wanki'

interface StoreItem {
  index?: string
  [key: string]: unknown
}

interface IDBStore extends DBSchema {
  [storeName: string]: {
    key: string
    value: StoreItem
    indexes: { index: string }
  }
}

export const idb = (() => {
  const defaultStore = async (
    dbName: string,
    storeName: string,
    updateEvent?: UpdateEventCallback | string[],
  ): Promise<{
    get: (key: string | number) => Promise<StoreValue>
    set: (key: string | number, val: StoreValue) => Promise<IDBValidKey>
    del: (key: string | number) => Promise<void>
    update: (
      key: string | number,
      updateFn: UpdateFunction,
    ) => Promise<IDBValidKey>
    all: () => Promise<StoreValue[]>
    clear: () => Promise<void>
    keys: () => Promise<IDBValidKey[]>
    close: () => Promise<void>
  }> => {
    const dbPromise = await openDB<IDBStore>(dbName, 1, {
      upgrade(db) {
        const store = db.createObjectStore(storeName, { autoIncrement: true })
        store.createIndex('index', 'index', { unique: true })
      },
    })

    function callUpdate(): void {
      if (typeof updateEvent === 'function') {
        return updateEvent()
      }

      if (typeof updateEvent === 'object' && updateEvent.length !== undefined) {
        updateEvent.forEach((event) => {
          document.dispatchEvent(new Event(event))
        })
      }
    }

    async function get(key: string | number): Promise<StoreValue> {
      return dbPromise.get(storeName, '' + key) as Promise<StoreValue>
    }
    async function set(
      key: string | number,
      val: StoreValue,
    ): Promise<IDBValidKey> {
      const result = await dbPromise.put(storeName, val, '' + key)
      callUpdate()
      return result
    }
    async function update(
      key: string | number,
      updateFn: UpdateFunction,
    ): Promise<IDBValidKey> {
      const result = await get(key)
      return await set(key, updateFn(result))
    }
    async function del(key: string | number): Promise<void> {
      const result = await dbPromise.delete(storeName, '' + key)
      callUpdate()
      return result
    }
    async function clear(): Promise<void> {
      const result = await dbPromise.clear(storeName)
      callUpdate()
      return result
    }
    async function keys(): Promise<IDBValidKey[]> {
      return dbPromise.getAllKeys(storeName)
    }
    async function all(): Promise<StoreValue[]> {
      return dbPromise.getAll(storeName) as Promise<StoreValue[]>
    }
    async function close(): Promise<void> {
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

interface DecompressedFile {
  collection: Uint8Array
  media: Record<string, unknown>[]
  files: Uint8Array[]
}

interface Deck {
  decompressedFile: DecompressedFile
  tables: {
    col: Record<string, unknown>
  }
}

interface WorkerList {
  [key: string]: boolean
}

export const importDeck = async (
  decompressedFile: DecompressedFile,
): Promise<Promise<WorkerList>[]> => {
  const sqlDb = await initSqlDb(decompressedFile.collection)

  const graves = sqlPrepare(sqlDb, 'select * from graves')
  const notes = sqlPrepare(sqlDb, 'select * from notes')
  const revlog = sqlPrepare(sqlDb, 'select * from revlog')
  const cards = sqlPrepare(sqlDb, 'select * from cards')
  const col = sqlPrepare(sqlDb, 'select * from col limit 1')

  const cast = (
    json: string | Record<string, unknown>,
  ): Record<string, unknown> =>
    typeof json === 'string' ? JSON.parse(json) : json
  const models = Object.values(cast(col[0].models) || {})
  const decks = Object.values(cast(col[0].decks) || {})
  const dconf = Object.values(cast(col[0].dconf) || {})
  const tags = Object.values(cast(col[0].tags) || {})

  delete col[0].models
  delete col[0].decks
  delete col[0].dconf
  delete col[0].tags

  const workerList: WorkerList = {}
  const workerPromises: Promise<WorkerList>[] = []

  const work = ({
    table,
    data,
  }: {
    table: string
    data: Record<string, unknown>[]
  }): void => {
    workerPromises.push(
      new Promise((resolve, reject) => {
        // const worka = new WorkerBulkPut()

        ;(async () => {
          console.time('- ' + table)
          await wankidb.open()
          await wankidb[table as keyof typeof wankidb]
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

export const tableColJsonParse = (
  tableCol: Record<string, unknown>,
): Record<string, unknown> => {
  if (typeof tableCol.conf === 'string') {
    tableCol.conf = JSON.parse(tableCol.conf as string)
  }
  if (typeof tableCol.models === 'string') {
    tableCol.models = JSON.parse(tableCol.models as string)
  }
  if (typeof tableCol.decks === 'string') {
    tableCol.decks = JSON.parse(tableCol.decks as string)
  }
  if (typeof tableCol.dconf === 'string') {
    tableCol.dconf = JSON.parse(tableCol.dconf as string)
  }
  if (typeof tableCol.tags === 'string') {
    tableCol.tags = JSON.parse(tableCol.tags as string)
  }
  return tableCol
}

export const updateDeckParsed = async (
  deckId: string | number,
): Promise<void> => {
  const tableCol = tableColJsonParse(
    await sqlDeck(deckId, 'select * from col limit 1'),
  )

  await (
    await idbDecks
  ).update(deckId, (result: Deck) => {
    result.tables.col = tableCol
    return result
  })
}

export const saveDirtySql = async (deckId: string | number): Promise<void> => {
  const uint8Array = await exportSqlDb(deckId)

  await (
    await idbDecks
  ).update(deckId, (result: Deck) => {
    result.decompressedFile.collection = uint8Array
    return result
  })
}
