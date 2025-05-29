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
    workerDecompress.onmessage = (event: MessageEvent<unknown>) => {
      const decompressedfile = (event.data as unknown[])[1] as DecompressedFile
      if (decompressedfile) {
        resolve(decompressedfile)
      }
    }

    workerDecompress.onerror = (e: ErrorEvent) => reject(new Error(e.message))
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

export const fun = (parsedDeck: DecompressedFile): PlayFunction => {
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
        const playMedia = media(parsedDeck)
        await playMedia(ii + start)
      } catch (e) {
        console.error(e)
      }
    }
  }
}

type MediaPlayFunction = (index: number | string) => Promise<void>

export const media = (parsedDeck: DecompressedFile): MediaPlayFunction => {
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
