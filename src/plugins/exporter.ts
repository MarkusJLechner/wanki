import { idbDecks } from '@/plugins/idb'
import { zipSync, ZipOptions } from 'fflate'

interface DecompressedFile {
  collection: Uint8Array
  media: Record<string, unknown>[] | Uint8Array
  files: Uint8Array[]
}

interface Deck {
  id?: string
  name: string
  decompressedFile: DecompressedFile
  tables?: {
    col: Record<string, unknown>
  }
}

export const exportDeck = async (deckId: string): Promise<void> => {
  const deck = (await (await idbDecks).get(deckId)) as unknown as
    | Deck
    | undefined
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
    {} as Record<string | number, Uint8Array>,
  )
  decompressedFile['collection.anki2'] = deck.decompressedFile.collection
  decompressedFile.media = deck.decompressedFile.media

  const deckNameSanitized = deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const filename = `${deckNameSanitized}.apkg`

  const compressed = await new Promise<Uint8Array>((resolve) => {
    resolve(
      zipSync(decompressedFile, {
        // Higher level means lower performance but better compression
        // The level ranges from 0 (no compression) to 9 (max compression)
        // The default level is 6
        level: 0,
        // GZIP-specific: the modification time. Can be a Date, date string,
        // or Unix timestamp
        mtime: new Date().toISOString(),
      } as unknown as ZipOptions),
    )
  })

  await downloadBlob(compressed, filename, 'application/zip')
}

export const downloadURL = (data: string, fileName: string): void => {
  const a = document.createElement('a')
  a.href = data
  a.download = fileName
  document.body.appendChild(a)
  a.style.display = 'none'
  a.click()
  a.remove()
}

export const downloadBlob = async (
  data: Uint8Array | Blob,
  fileName: string,
  mimeType: string,
): Promise<void> => {
  const blob = new Blob([data], {
    type: mimeType,
  })

  const url = window.URL.createObjectURL(blob)

  downloadURL(url, fileName)

  return new Promise<void>((resolve) =>
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      resolve()
    }, 500),
  )
}
