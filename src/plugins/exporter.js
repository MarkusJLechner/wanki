import { idbDecks } from '@/plugins/idb.js'
import { zipSync } from 'fflate'

export const exportDeck = async (deckId) => {
  const deck = await (await idbDecks).get(deckId)
  if (!deck) {
    throw new Error('Could not find deck')
  }

  const textEncoder = new TextEncoder()

  deck.decompressedFile.media = textEncoder.encode(
    JSON.stringify(deck.decompressedFile.media),
  )
  const decompressedFile = deck.decompressedFile.files.reduce(
    (obj, item, index) => {
      return {
        ...obj,
        [index]: item,
      }
    },
    {},
  )
  decompressedFile['collection.anki2'] = deck.decompressedFile.collection
  decompressedFile.media = deck.decompressedFile.media

  const deckNameSanitized = deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const filename = `${deckNameSanitized}.apkg`

  const compressed = await new Promise((resolve) => {
    resolve(
      zipSync(decompressedFile, {
        // GZIP-specific: the filename to use when decompressed
        filename,
        // Higher level means lower performance but better compression
        // The level ranges from 0 (no compression) to 9 (max compression)
        // The default level is 6
        level: 0,
        // GZIP-specific: the modification time. Can be a Date, date string,
        // or Unix timestamp
        mtime: new Date().toISOString(),
      }),
    )
  })

  await downloadBlob(compressed, filename, 'application/zip')
}

export const downloadURL = async (data, fileName) => {
  const a = document.createElement('a')
  a.href = data
  a.download = fileName
  document.body.appendChild(a)
  a.style.display = 'none'
  a.click()
  a.remove()
}

export const downloadBlob = async (data, fileName, mimeType) => {
  const blob = new Blob([data], {
    type: mimeType,
  })

  const url = window.URL.createObjectURL(blob)

  await downloadURL(url, fileName)

  return new Promise((resolve) =>
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      resolve()
    }, 500),
  )
}
