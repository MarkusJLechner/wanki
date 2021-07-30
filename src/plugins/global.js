import { refstorage } from 'store/globalstate.js'
import { defaultSettings } from './defaultSettings.js'

export const vibrate = (pattern = 30) => {
  if (refstorage.getSetting(defaultSettings.general.vibrate)) {
    navigator.vibrate(pattern)
  }
}

export const isMobile =
  'ontouchstart' in document.documentElement &&
  /mobi/i.test(navigator.userAgent)

export const sleep = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout))

export function createTimer({
  duration = 60,
  callback = () => {},
  runOnStart = true,
}) {
  let timer = 0
  let paused = !runOnStart
  let minutes, seconds
  let interval = null
  const set = (duration) => {
    interval = setInterval(function () {
      if (!paused) {
        minutes = parseInt('' + timer / 60, 10)
        seconds = parseInt('' + (timer % 60), 10)

        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = seconds < 10 ? '0' + seconds : seconds

        callback(timer, minutes + ':' + seconds)

        if (timer++ >= duration) {
          clearInterval(interval)
          interval = null
        }
      }
    }, 1000)
  }

  if (runOnStart) {
    set(duration)
  }

  const start = () => {
    if (interval === null) {
      set(duration)
    }
    paused = false
  }
  const pause = () => (paused = true)
  const reset = () => {
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

export function promptFile(accept, multiple = false) {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = multiple
  input.accept = accept
  return new Promise(function (resolve, reject) {
    try {
      document.activeElement.onfocus = function () {
        document.activeElement.onfocus = null
        setTimeout(resolve, 200)
      }
      input.onchange = function () {
        const files = Array.from(input.files)
        if (multiple) return resolve(files)
        resolve(files[0])
      }
      input.click()
    } catch (e) {
      reject(e)
    }
  })
}

export function promiseProgress(proms, progressCallback) {
  let d = 0
  const l = proms.length
  progressCallback({ percent: 0, total: l, value: 0, payload: null })
  for (const p of proms) {
    p.then((pl) => {
      d++
      const percent = (d * 100) / proms.length
      progressCallback({ percent, total: l, value: d, payload: pl })
    })
  }
  return Promise.all(proms)
}

export function deferPromise(obj = {}) {
  obj.resolve = () => {}
  obj.reject = () => {}
  obj.promise = new Promise((resolve, reject) => {
    obj.resolve = resolve
    obj.reject = reject
  })

  return obj
}

export function addTask(task) {
  const unique = Math.floor(Math.random() * 6)
  document.dispatchEvent(
    new CustomEvent('background/task', { detail: { ...task, unique } }),
  )
  return unique
}

export function finishTask(id) {
  document.dispatchEvent(
    new CustomEvent('background/task', {
      detail: { id, unique: id, remove: true },
    }),
  )
}

export async function playAudio(uint8) {
  const blob = new Blob([uint8])

  if (!blob) {
    throw new Error('File is empty')
  }

  const url = await URL.createObjectURL(blob)
  const audio = new Audio()
  audio.src = url
  await audio.play()
}

const regexMedia = /\[(?<type>[^:\[\]]+):(?<media>[^\]]+)]/gm
export function getMediaFromNote(string) {
  const regex = regexMedia
  let m
  let matches = []

  while ((m = regex.exec(string)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    matches.push(m.groups)
  }

  return matches
}

export const getFileMimeType = (file) => {
  const arr = file.subarray(0, 4)
  let header = ''
  for (let i = 0; i < arr.length; i++) {
    header += arr[i].toString(16)
  }
  let type
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
  // Making the function async.
  // noinspection UnreachableCodeJS
  return new Promise((resolve) => {
    let fileReader = new FileReader()
    fileReader.onloadend = (event) => {
      const byteArray = new Uint8Array(event.target.result)

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
      const mimeTypes = [
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
      resolve()
    }
    // Slice enough bytes to get readable strings.
    // I chose 32 arbitrarily. Note that some headers are offset by
    // a number of bytes.
    fileReader.readAsArrayBuffer(file.slice(0, 32))
  })
}

export function replaceMediaFromNote(string, replace = '') {
  if (typeof string === 'string') {
    return string.replace(regexMedia, replace)
  }
  return string
}

export async function replaceAsync(str, regex, asyncFn) {
  const promises = []
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args)
    promises.push(promise)
  })
  const data = await Promise.all(promises)
  return str.replace(regex, () => data.shift())
}

export const resolveObjectPath = (object, path, defaultValue) => {
  return path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), object)
}
