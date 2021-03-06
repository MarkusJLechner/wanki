import { wankidb } from '@/plugins/wankidb/db'

self.onmessage = async (event) => {
  const { table, data } = event.data

  console.time('- ' + table)
  await wankidb.open()
  await wankidb[table]
    .bulkPut(data)
    .catch((e) => {
      self.postMessage({ error: e.message })
    })
    .finally(() => console.timeEnd('- ' + table))

  self.postMessage(true)
}
