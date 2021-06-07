import { unzipSync } from 'fflate'
import initSqlJs from 'sql.js/dist/sql-asm.js'
import { database } from '@/plugins/storage.js'

export const parseFile = async (file) => {
  if (!file) {
    throw new Error('No file defined')
  }

  const fileBuffer = await file.arrayBuffer()

  const decompressed = await new Promise((resolve) => {
    resolve(unzipSync(new Uint8Array(fileBuffer)))
  })

  let valid = false
  const filesDecompressed = Object.keys(decompressed).map((key) => {
    let value = decompressed[key]
    let type = 'media'
    if (key === 'media') {
      type = 'mapping'
      value = JSON.parse(new TextDecoder().decode(value))
    }
    if (key === 'collection.anki2') {
      valid = true
      type = 'sql'
    }
    return { filename: key, file: value, type: type }
  })

  if (!valid) {
    throw new Error('No valid anki file')
  }

  const parsed = {
    sqllite: null,
    media: [],
    mediaMapping: {},
  }

  filesDecompressed.forEach((file) => {
    if (file.type === 'sql') {
      parsed.sqllite = file.file
    }

    if (file.type === 'mapping') {
      parsed.mediaMapping = file.file
    }

    if (file.type === 'media') {
      parsed.media[file.filename] = file.file
    }
  })

  let database = null
  try {
    const SQL = await initSqlJs()
    database = new SQL.Database(parsed.sqllite)
  } catch (e) {
    console.log(e)
    throw new Error('Error while parsing database')
  }

  return {
    mediaMapping: parsed.mediaMapping,
    media: parsed.media,
    db: database,
  }
}

export const fun = async (parsedDeck) => {
  return async function play({ max = 5, start = 0, time = 600 } = {}) {
    for (let ii = 0; ii < max; ii++) {
      await new Promise((resolve) => {
        setTimeout(resolve, time)
      })
      try {
        ;(await media(parsedDeck)).play(ii + start)
      } catch (e) {
        console.error(e)
      }
    }
  }
}

export const media = async (parsedDeck) => {
  return async function play(index) {
    if (typeof index === 'string') {
      index = Object.values(parsedDeck.mediaMapping).findIndex(
        (a) => a === index,
      )
    }

    const uint8 = parsedDeck.media[index]
    if (!uint8) {
      throw new Error(
        'Could not find media with index ' +
          index +
          ' in filelength ' +
          parsedDeck.media.length,
      )
    }

    const blob = new Blob([uint8.buffer])

    const url = await URL.createObjectURL(blob)
    const audio = new Audio()
    audio.src = url
    return audio.play()
  }
}

export const importParsedObject = async (object) => {
  const sqlDecks = JSON.parse(
    object.db.exec('select decks from col limit 1')[0].values,
  )

  console.log({ sqlDecks })

  const [sqlDeckId, sqlDeckCol] = Object.entries(sqlDecks).filter(
    (entry) => entry[1].name !== 'Default',
  )[0]

  console.log([sqlDeckId, sqlDeckCol])
  const deck = await database.deck
  await deck.set(sqlDeckId, {
    name: sqlDeckCol.name,
    id: sqlDeckId,
    apkg: object,
    col: sqlDeckCol,
  })

  document.dispatchEvent(new Event('page/overview/update'))
  document.dispatchEvent(new Event('indexeddb/decks/update'))
}
