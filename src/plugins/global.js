import { refstorage } from 'store/globalstate.js'
import { defaultSettings } from './defaultSettings.js'

export const vibrate = (pattern = 30) => {
  if (refstorage.getSetting(defaultSettings.general.vibrate)) {
    navigator.vibrate(pattern)
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
    new CustomEvent('background/task', { detail: { id, remove: true } }),
  )
}
