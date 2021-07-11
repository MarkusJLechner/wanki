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
