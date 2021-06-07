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
  const defaultStore = async (dbName, storeName) => {
    const dbPromise = await openDB(dbName, 1, {
      upgrade(db, oldVersion, newVersion) {
        db.createObjectStore(storeName, { autoIncrement: true })
      },
    })

    async function get(key) {
      return dbPromise.get(storeName, key)
    }
    async function set(key, val) {
      return dbPromise.put(storeName, val, key)
    }
    async function del(key) {
      return dbPromise.delete(storeName, key)
    }
    async function clear() {
      return dbPromise.clear(storeName)
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
    deck: defaultStore(dbName, 'decks'),
  }
})()
