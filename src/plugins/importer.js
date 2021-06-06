/* globals zip, document, URL, MouseEvent, AbortController, alert */

import * as zip from 'plugins/zip/zip.min.js'
import { unzipSync } from 'fflate'
import initSqlJs from 'sql.js/dist/sql-asm.js'

export const parseFile = async (file) => {
  console.time('fflate t')
  const fileBuffer = await file.arrayBuffer()

  const decompressed = await new Promise((resolve) => {
    resolve(unzipSync(new Uint8Array(fileBuffer)))
  })
  const filesDecompressed = Object.keys(decompressed).map((key) => {
    let value = decompressed[key]
    let type = 'media'
    if (key === 'media') {
      type = 'mapping'
      value = JSON.parse(new TextDecoder().decode(value))
    }
    if (key === 'collection.anki2') {
      type = 'sql'
    }
    return { filename: key, file: value, type: type }
  })
  console.timeEnd('fflate t')

  const parsed = {
    sqllite: null,
    media: [],
    mediaMapping: {},
  }

  console.time('foreach')
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
  console.timeEnd('foreach')

  const playMedia = async (index) => {
    if (typeof index === 'string') {
      index = Object.values(parsed.mediaMapping).findIndex((a) => a === index)
    }
    const blob = new Blob([parsed.media[index].buffer])

    if (!blob) {
      throw new Error(
        'Could not find media with index ' +
          index +
          ' in filelength ' +
          parsed.media.length,
      )
    }

    const url = await URL.createObjectURL(blob)
    const audio = new Audio()
    audio.src = url
    return audio.play()
  }

  const fun = async ({ max = 5, start = 0, time = 600 } = {}) => {
    for (let ii = 0; ii < max; ii++) {
      await new Promise((resolve) => {
        setTimeout(resolve, time)
      })
      try {
        await playMedia(ii + start)
      } catch (e) {
        console.error(e)
      }
    }
  }

  let database = null
  try {
    console.time('sql')
    const SQL = await initSqlJs()
    database = new SQL.Database(parsed.sqllite)
    console.timeEnd('sql')
  } catch (e) {
    console.log(e)
    throw new Error('Error while parsing database')
  }

  fun({ start: 0, max: 10, time: 500 })

  return {
    playMedia: playMedia,
    mediaMapping: parsed.mediaMapping,
    sqllite: parsed.sqllite,
    media: parsed.media,
    db: database,
    fun: fun,
  }
}
