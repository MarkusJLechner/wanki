import { refstorage } from '@/store/globalstate'
import { defaultSettings } from './defaultSettings'
import { resolveObjectPath } from './utils'

export const vibrate = (pattern: number = 30): void => {
  if (refstorage.getSetting(defaultSettings.general.vibrate)) {
    navigator.vibrate(pattern)
  }
}

export const isMobile: boolean =
  'ontouchstart' in document.documentElement &&
  /mobi/i.test(navigator.userAgent)

export const sleep = (timeout: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, timeout))

interface TimerOptions {
  duration?: number
  callback?: (timer: number, formattedTime: string) => void
  runOnStart?: boolean
}

export interface Timer {
  start: () => void
  pause: () => void
  set: (duration: number) => void
  reset: () => void
}

export function createTimer({
  duration = 60,
  callback = () => {},
  runOnStart = true,
}: TimerOptions = {}): Timer {
  let timer = 0
  let paused = !runOnStart
  let minutes: string | number
  let seconds: string | number
  let interval: ReturnType<typeof setInterval> | null = null

  const set = (duration: number): void => {
    interval = setInterval(function () {
      if (!paused) {
        minutes = parseInt('' + timer / 60, 10)
        seconds = parseInt('' + (timer % 60), 10)

        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = seconds < 10 ? '0' + seconds : seconds

        callback(timer, minutes + ':' + seconds)

        if (timer++ >= duration) {
          if (interval !== null) {
            clearInterval(interval)
          }
          interval = null
        }
      }
    }, 1000)
  }

  if (runOnStart) {
    set(duration)
  }

  const start = (): void => {
    if (interval === null) {
      set(duration)
    }
    paused = false
  }

  const pause = (): void => {
    paused = true
  }

  const reset = (): void => {
    timer = 0
    callback(0, '00:00')
    start()
  }

  return {
    start,
    pause,
    set,
    reset,
  }
}

export function promptFile(
  accept: string,
  multiple: boolean = false,
): Promise<File | File[]> {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = multiple
  input.accept = accept

  return new Promise(function (resolve, reject) {
    try {
      document.activeElement!.onfocus = function () {
        if (document.activeElement) {
          document.activeElement.onfocus = null
        }
        setTimeout(resolve, 200)
      }

      input.onchange = function () {
        const files = Array.from(input.files || [])
        if (multiple) return resolve(files)
        resolve(files[0])
      }

      input.click()
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}

interface ProgressData<T> {
  percent: number
  total: number
  value: number
  payload: T | null
}

export function promiseProgress<T>(
  proms: Promise<T>[],
  progressCallback: (data: ProgressData<T>) => void,
): Promise<T[]> {
  let d = 0
  const l = proms.length
  progressCallback({ percent: 0, total: l, value: 0, payload: null })

  for (const p of proms) {
    void p.then((pl) => {
      d++
      const percent = (d * 100) / proms.length
      progressCallback({ percent, total: l, value: d, payload: pl })
    })
  }

  return Promise.all(proms)
}

interface DeferredPromise<T> {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

export function deferPromise<T>(
  obj: Partial<DeferredPromise<T>> = {},
): DeferredPromise<T> {
  const deferred = obj as DeferredPromise<T>
  deferred.resolve = () => {}
  deferred.reject = () => {}

  deferred.promise = new Promise<T>((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })

  return deferred
}

interface Task {
  id: string | number
  [key: string]: unknown
}

export function addTask(task: Task): number {
  const unique = Math.floor(Math.random() * 6)
  document.dispatchEvent(
    new CustomEvent('background/task', { detail: { ...task, unique } }),
  )
  return unique
}

export function finishTask(id: string | number): void {
  document.dispatchEvent(
    new CustomEvent('background/task', {
      detail: { id, unique: id, remove: true },
    }),
  )
}

export async function playAudio(uint8: Uint8Array): Promise<void> {
  const blob = new Blob([uint8])

  if (!blob) {
    throw new Error('File is empty')
  }

  const url = URL.createObjectURL(blob)
  const audio = new Audio()
  audio.src = url
  await audio.play()
}

interface MediaMatch {
  type: string
  media: string
}

const regexMedia = /\[(?<type>[^:\[\]]+):(?<media>[^\]]+)]/gm

export function getMediaFromNote(string: string): MediaMatch[] {
  const regex = regexMedia
  let m: RegExpExecArray | null
  const matches: MediaMatch[] = []

  while ((m = regex.exec(string)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    if (m.groups) {
      matches.push(m.groups as MediaMatch)
    }
  }

  return matches
}

export const getFileMimeType = (file: Uint8Array): string => {
  const arr = file.subarray(0, 4)
  let header = ''
  for (let i = 0; i < arr.length; i++) {
    header += arr[i].toString(16)
  }
  let type: string
  switch (header) {
    case '89504e47':
      type = 'image/png'
      break
    case '47494638':
      type = 'image/gif'
      break
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
    case 'ffd8ffe3':
    case 'ffd8ffe8':
      type = 'image/jpeg'
      break
    default:
      type = 'audio/mp3' // Or you can use the blob.type as fallback
      break
  }
  return type

  // The code below is unreachable due to the return statement above
  // Keeping it commented for reference
  /*
  return new Promise<string | undefined>((resolve) => {
    let fileReader = new FileReader()
    fileReader.onloadend = (event) => {
      if (!event.target || !event.target.result) {
        resolve(undefined)
        return
      }

      const byteArray = new Uint8Array(event.target.result as ArrayBuffer)

      // Checking if it's JPEG. For JPEG we need to check the first 2 bytes.
      // We can check further if more specific type is needed.
      if (byteArray[0] === 255 && byteArray[1] === 216) {
        resolve('image/jpeg')
        return
      }

      // If it's not JPEG we can check for signature strings directly.
      // This is only the case when the bytes have a readable character.
      const td = new TextDecoder('utf-8')
      const headerString = td.decode(byteArray)

      // Array to be iterated [<string signature>, <MIME type>]
      const mimeTypes: [string, string][] = [
        // Images
        ['PNG', 'image/png'],
        // Audio
        ['ID3', 'audio/mpeg'], // MP3
        // Video
        ['ftypmp4', 'video/mp4'], // MP4
        ['ftypisom', 'video/mp4'], // MP4
        // HTML
        ['<!DOCTYPE html>', 'text/html'],
        // PDF
        ['%PDF', 'application/pdf'],
        // Add the needed files for your case.
      ]

      // Iterate over the required types.
      for (let i = 0; i < mimeTypes.length; i++) {
        // If a type matches we return the MIME type
        if (headerString.indexOf(mimeTypes[i][0]) > -1) {
          resolve(mimeTypes[i][1])
          return
        }
      }

      // If not is found we resolve with a blank argument
      resolve(undefined)
    }
    // Slice enough bytes to get readable strings.
    // I chose 32 arbitrarily. Note that some headers are offset by
    // a number of bytes.
    fileReader.readAsArrayBuffer(new Blob([file.slice(0, 32)]))
  })
  */
}

export function replaceMediaFromNote(
  text: string,
  replace: string = '',
): string {
  return text.replace(regexMedia, replace)
}

export async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (match: string, ...args: unknown[]) => Promise<string>,
): Promise<string> {
  const promises: Promise<string>[] = []
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...(args as unknown[]))
    promises.push(promise)
    return match
  })
  const data = await Promise.all(promises)
  return str.replace(regex, () => data.shift() || '')
}

// Re-export resolveObjectPath from utils.js for backward compatibility
export { resolveObjectPath }
