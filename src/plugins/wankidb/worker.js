import { wankidb } from './db'

self.onmessage = async (event) => {
  const { table, data } = event.data

  console.time('- ' + table)
  await wankidb.open()
  await wankidb[table]
    .bulkPut(data)
    .finally(() => console.timeEnd('- ' + table))

  self.postMessage(true)
}
