import { createI18n } from 'vue-i18n'

export const messages = {
  en: {
    'Add Note': 'Add Note',
    Deck: 'Deck',
    Model: 'Model',
    'This field is required': 'This field is required',
    Add: 'Add',
    'Loading...': 'Loading...',
  },
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
