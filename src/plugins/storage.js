import { openDB } from 'idb/with-async-ittr.js'

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

export const database = (() => {
  const defaultStore = async (dbName, storeName, updateEvent) => {
    const dbPromise = await openDB(dbName, 1, {
      upgrade(db, oldVersion, newVersion) {
        db.createObjectStore(storeName, { autoIncrement: true })
      },
    })

    function callUpdate() {
      return updateEvent && updateEvent()
    }

    async function get(key) {
      return dbPromise.get(storeName, '' + key)
    }
    async function set(key, val) {
      const result = await dbPromise.put(storeName, val, '' + key)
      callUpdate()
      return result
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
      all,
      clear,
      keys,
      close,
    }
  }

  const dbName = 'wanki'

  return {
    decks: defaultStore(dbName, 'decks', () => {
      document.dispatchEvent(new Event('page/overview/update'))
      document.dispatchEvent(new Event('indexeddb/decks/update'))
    }),
  }
})()
