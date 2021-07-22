import { ref, watch } from 'vue'
import { vibrate } from '../plugins/global.js'
import { nanoid } from 'nanoid'
import { ToastType } from '@/plugins/conts.js'

const storeItemSubscribers = {}

export const refstorage = {
  init: (key, Default) => {
    if (!storeItemSubscribers[key]) {
      storeItemSubscribers[key] = ref(
        JSON.parse(localStorage.getItem(key)) ?? Default ?? null,
      )

      watch(storeItemSubscribers[key], () => {
        localStorage.setItem(
          key,
          JSON.stringify(storeItemSubscribers[key].value),
        )
      })
    }
  },
  ref: (key) => {
    refstorage.init(key)
    return storeItemSubscribers[key]
  },
  getSetting: (setting) => {
    refstorage.init(setting.key, setting.default)

    return storeItemSubscribers[setting.key].value
  },
  get: (key, Default) => {
    refstorage.init(key, Default)

    return storeItemSubscribers[key].value
  },
  set: (key, value) => {
    vibrate()

    refstorage.init(key, value)

    storeItemSubscribers[key].value = value
  },
  toggle: (key) => {
    vibrate()

    refstorage.init(key, false)

    storeItemSubscribers[key].value = !storeItemSubscribers[key].value
  },
}

export const darkTheme = ref(
  JSON.parse(localStorage.getItem('darkTheme')) || false,
)
watch(darkTheme, () => {
  localStorage.setItem('darkTheme', JSON.stringify(darkTheme.value))
})

export const modalOpened = ref(false)

export const toasts = ref([])

export const addToast = ({ type, text, timeout = 3 }) => {
  const id = nanoid(4)
  if (type !== ToastType.error && type !== ToastType.success) {
    type = ToastType.info
  }
  const item = {
    id,
    type,
    text,
    timeout,
  }
  toasts.value = [...toasts.value, item]

  setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }, timeout * 1000)
}
