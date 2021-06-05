/* globals zip, document, URL, MouseEvent, AbortController, alert */

import * as zip from 'plugins/zip/zip.min.js'
import * as initSqlJs from 'sql.js'

export const parseFile = async (file) => {
  const zip = window.zip

  zip.configure({
    workerScripts: { inflate: ['/z-worker.js'] },
  })

  const zipGetEntries = (file, options) => {
    return new zip.ZipReader(new zip.BlobReader(file)).getEntries(options)
  }

  const entries = await zipGetEntries(file, {
    filenameEncoding: 'cp437',
  })

  let files = []
  const parsed = {
    sqllite: null,
    media: [],
    mediaMapping: {},
  }

  if (entries.length) {
    files = await Promise.all(
      entries.map(async (entry) => {
        const isMedia = +entry.filename >= 0
        const isSql = entry.filename === 'collection.anki2'
        const isMapping = entry.filename === 'media'

        const type = (() => {
          if (isSql) {
            return 'sql'
          }
          if (isMedia) {
            return 'media'
          }
          if (isMapping) {
            return 'mapping'
          }

          return ''
        })()

        const writer = () => {
          if (isSql) {
            return new zip.Uint8ArrayWriter()
          }
          if (isMedia) {
            return new zip.BlobWriter()
          }

          return new zip.TextWriter()
        }
        let file = await entry.getData(writer(), {
          onprogress: (index, max) => {},
        })

        if (isMapping) {
          file = JSON.parse(file)
        }

        const filename = Number.isNaN(Number.parseInt(entry.filename))
          ? entry.filename
          : +entry.filename

        return { filename: filename, file: file, type: type }
      }),
    )

    files.forEach((file) => {
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
  }

  //const SQL = await initSqlJs({
  //  // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
  //  // You can omit locateFile completely when running in node
  //  locateFile: (file) => `https://sql.js.org/dist/${file}`,
  //})
  //
  //const db = new SQL.Database(parsed.sqllite)

  // console.log(SQL)

  const playMedia = async (index) => {
    if (typeof index === 'string') {
      index = Object.values(parsed.mediaMapping).findIndex((a) => a === index)
    }
    const blob = parsed.media[index]

    const url = await URL.createObjectURL(blob)
    const audio = new Audio()
    audio.src = url
    await audio.play()
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

  await fun({ start: 100, max: 10, time: 500 })

  return {
    playMedia: playMedia,
    mediaMapping: parsed.mediaMapping,
    sqllite: parsed.sqllite,
    media: parsed.media,
    fun: fun,
  }
}
