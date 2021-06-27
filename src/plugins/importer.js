import WorkerDecompressFile from '@/plugins/workers/decompressFile.js?worker'

export const decompressFile = (file) => {
  const workerDecompress = new WorkerDecompressFile()
  const promise = new Promise((resolve, reject) => {
    workerDecompress.onmessage = (event) => {
      const decompressedfile = event.data[1]
      if (decompressedfile) {
        resolve(decompressedfile)
      }
    }

    workerDecompress.onerror = (e) => reject(e)
  })
  workerDecompress.postMessage({
    file,
  })

  return { promise, worker: workerDecompress }
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
      index = Object.values(parsedDeck.media).findIndex((a) => a === index)
    }

    const uint8 = parsedDeck.files[index]
    if (!uint8) {
      throw new Error(
        'Could not find media with index ' +
          index +
          ' in filelength ' +
          parsedDeck.files.length,
      )
    }

    const blob = new Blob([uint8.buffer])

    const url = await URL.createObjectURL(blob)
    const audio = new Audio()
    audio.src = url
    return audio.play()
  }
}
