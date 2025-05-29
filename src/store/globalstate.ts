import { ref, watch, Ref } from 'vue'
import { vibrate } from '@/plugins/global'
import { resolveObjectPath } from '@/plugins/utils'
import { nanoid } from 'nanoid'
import { ToastType } from '@/plugins/conts'
import { DefaultSettings, defaultSettings } from '@/plugins/defaultSettings'

interface StoreItemSubscribers {
  [key: string]: Ref<unknown>
}

interface Setting {
  key: string
  default?: unknown
}

interface DefaultSetting {
  default?: unknown
  valueType?: 'number' | 'boolean' | (string & {})
}

interface Toast {
  id: string
  type: string
  text: string
  timeout: number
}

const storeItemSubscribers: StoreItemSubscribers = {}

const parseType = (value: unknown, type?: string): unknown => {
  if (type === 'number') {
    if (typeof value === 'string' || typeof value === 'number') {
      return +value
    } else {
      throw new Error('Invalid number')
    }
  }
  if (type === 'boolean') {
    return !!JSON.parse(String(value))
  }
  return value
}

export const refstorage = {
  init: (key: string, Default?: unknown): void => {
    if (!storeItemSubscribers[key]) {
      const defaultSetting = refstorage.getDefaultSetting(key)?.default
      storeItemSubscribers[key] = ref(
        JSON.parse(localStorage.getItem(key) || 'null') ??
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

  getDefaultSetting: (path?: string): DefaultSetting | null => {
    if (!path) {
      return null
    }
    return resolveObjectPath<DefaultSetting | null, DefaultSettings>(
      defaultSettings,
      path.replace('setting.', ''),
      null,
    )
  },

  ref: (key: string): Ref<unknown> => {
    refstorage.init(key)
    return storeItemSubscribers[key]
  },

  getSetting: (setting: Setting): unknown => {
    const valueType = refstorage.getDefaultSetting(setting.key)?.valueType
    refstorage.init(setting.key, setting.default)

    return parseType(storeItemSubscribers[setting.key].value, valueType)
  },

  getValueType(key: string, Default?: string): string | undefined {
    return this.getDefaultSetting(key)?.valueType ?? Default
  },

  get: (key: string, Default?: unknown): unknown => {
    const valueType = refstorage.getDefaultSetting(key)?.valueType
    refstorage.init(key, Default)

    return parseType(storeItemSubscribers[key].value, valueType)
  },

  set: (key: string, value: unknown): void => {
    vibrate()

    refstorage.init(key, value)

    storeItemSubscribers[key].value = value
  },

  toggle: (key: string): void => {
    vibrate()

    refstorage.init(key)

    storeItemSubscribers[key].value = !storeItemSubscribers[key].value
  },
}

// Initialize darkTheme in refstorage
refstorage.init('darkTheme', false)

export const modalOpened = ref(false)

export const toasts = ref<Toast[]>([])

export const addToast = ({
  type,
  text,
  timeout = 3,
}: {
  type: string
  text: string
  timeout?: number
}): void => {
  const id = nanoid(4)
  if (type !== ToastType.error && type !== ToastType.success) {
    type = ToastType.info
  }
  const item: Toast = {
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

export const removeToast = (id: string): void => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

export const clearToasts = (): void => {
  toasts.value = []
}
