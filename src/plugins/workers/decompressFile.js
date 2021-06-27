import { unzipSync } from 'fflate'

self.onmessage = async (event) => {
  const { file } = event.data

  if (!file) {
    throw new Error('No file defined')
  }

  const fileBuffer = await file.arrayBuffer()

  const tasks = ['decompress', 'parse', 'map']

  self.postMessage([tasks, null])

  console.time('decompress')
  const decompressed = await new Promise((resolve) => {
    resolve(unzipSync(new Uint8Array(fileBuffer)))
  })
  console.timeEnd('decompress')

  self.postMessage([tasks.splice(1), null])

  console.time('parse')
  let valid = false
  const filesDecompressed = Object.keys(decompressed).map((key) => {
    let value = decompressed[key]
    let type = 'media'
    if (key === 'media') {
      type = 'mapping'
      value = JSON.parse(new TextDecoder().decode(value))
    }
    if (key === 'collection.anki2' || key === 'collection.anki21') {
      valid = true
      type = 'sql'
    }
    return { filename: key, file: value, type: type }
  })
  console.timeEnd('parse')

  self.postMessage([tasks.splice(1), null])

  if (!valid) {
    throw new Error('No valid anki file')
  }

  const mapped = {
    collection: null,
    media: {},
  }

  let files = []
  let media = []

  console.time('map')
  filesDecompressed.forEach((file) => {
    if (file.type === 'sql') {
      mapped.collection = file.file
    }

    if (file.type === 'mapping') {
      media = file.file
    }

    if (file.type === 'media') {
      files[file.filename] = file.file
    }
  })
  console.timeEnd('map')

  mapped.media = Object.values(media).map((m, index) => {
    return { name: m, file: files[index] }
  })

  self.postMessage([tasks.splice(1), mapped])
}
