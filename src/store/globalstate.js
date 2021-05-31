import { ref, watch } from 'vue'

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
    refstorage.init(key, value)

    storeItemSubscribers[key].value = value
  },
  toggle: (key) => {
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
