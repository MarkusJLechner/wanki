import WorkerDecompressFile from '@/plugins/workers/decompressFile.js?worker'

interface DecompressedFile {
  files: Uint8Array[]
  media: Record<string, string>
  collection: Uint8Array
}

interface DecompressResult {
  promise: Promise<DecompressedFile>
  worker: Worker
}

export const decompressFile = (file: File): DecompressResult => {
  const workerDecompress = new WorkerDecompressFile()
  const promise = new Promise<DecompressedFile>((resolve, reject) => {
    workerDecompress.onmessage = (event: MessageEvent) => {
      const decompressedfile = event.data[1]
      if (decompressedfile) {
        resolve(decompressedfile)
      }
    }

    workerDecompress.onerror = (e: ErrorEvent) => reject(e)
  })
  workerDecompress.postMessage({
    file,
  })

  return { promise, worker: workerDecompress }
}

interface PlayOptions {
  max?: number
  start?: number
  time?: number
}

type PlayFunction = (options?: PlayOptions) => Promise<void>

export const fun = async (
  parsedDeck: DecompressedFile,
): Promise<PlayFunction> => {
  return async function play({
    max = 5,
    start = 0,
    time = 600,
  }: PlayOptions = {}): Promise<void> {
    for (let ii = 0; ii < max; ii++) {
      await new Promise<void>((resolve) => {
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

type MediaPlayFunction = (index: number | string) => Promise<void>

export const media = async (
  parsedDeck: DecompressedFile,
): Promise<MediaPlayFunction> => {
  return async function play(index: number | string): Promise<void> {
    let mediaIndex: number

    if (typeof index === 'string') {
      const foundIndex = Object.values(parsedDeck.media).findIndex(
        (a) => a === index,
      )
      if (foundIndex === -1) {
        throw new Error(`Could not find media with name ${index}`)
      }
      mediaIndex = foundIndex
    } else {
      mediaIndex = index
    }

    const uint8 = parsedDeck.files[mediaIndex]
    if (!uint8) {
      throw new Error(
        'Could not find media with index ' +
          mediaIndex +
          ' in filelength ' +
          parsedDeck.files.length,
      )
    }

    const blob = new Blob([uint8.buffer])

    const url = URL.createObjectURL(blob)
    const audio = new Audio()
    audio.src = url
    return audio.play()
  }
}
