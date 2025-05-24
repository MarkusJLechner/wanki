import { ref, watch } from 'vue'
import { resolveObjectPath, vibrate } from '../plugins/global.js'
import { nanoid } from 'nanoid'
import { ToastType } from '@/plugins/conts.js'
import { defaultSettings } from '@/plugins/defaultSettings.js'

const storeItemSubscribers = {}

const parseType = (value, type) => {
  if (type === 'number') {
    return +value
  }
  if (type === 'boolean') {
    if (typeof value === 'boolean') {
      return value
    }
    try {
      return !!JSON.parse(value)
    } catch (e) {
      return value === 'true'
    }
  }
  return value
}

export const refstorage = {
  init: (key, Default) => {
    if (!storeItemSubscribers[key]) {
      const defaultSetting = refstorage.getDefaultSetting(key)?.default
      storeItemSubscribers[key] = ref(
        JSON.parse(localStorage.getItem(key)) ??
          Default ??
          defaultSetting ??
          null,
      )

      watch(storeItemSubscribers[key], () => {
        localStorage.setItem(
          key,
          JSON.stringify(storeItemSubscribers[key].value),
        )
      })
    }
  },

  getDefaultSetting: (path) => {
    if (!path) {
      return null
    }
    return resolveObjectPath(
      defaultSettings,
      path.replace('setting.', ''),
      null,
    )
  },

  ref: (key) => {
    refstorage.init(key)
    return storeItemSubscribers[key]
  },

  getSetting: (setting) => {
    const valueType = refstorage.getDefaultSetting(setting.key)?.valueType
    refstorage.init(setting.key, setting.default)

    return parseType(storeItemSubscribers[setting.key].value, valueType)
  },

  getValueType(key, Default) {
    return this.getDefaultSetting(key)?.valueType ?? Default
  },

  get: (key, Default) => {
    const valueType = refstorage.getDefaultSetting(key)?.valueType
    refstorage.init(key, Default)

    return parseType(storeItemSubscribers[key].value, valueType)
  },

  set: (key, value) => {
    vibrate()

    refstorage.init(key, value)

    storeItemSubscribers[key].value = value
  },

  toggle: (key) => {
    vibrate()

    refstorage.init(key)

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

export const clearToasts = () => {
  toasts.value = []
}
