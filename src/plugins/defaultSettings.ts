interface GeneralSettings {
  fetchSync: boolean
  automaticSync: boolean
  displaySync: boolean
  shareFeature: boolean
  blinkLight: boolean
  vibrate: { key: string; default: boolean }
  useCard: {
    default: string
    items: Array<{ text: string; value: string }>
  }
  language: { key: string; default: string }
}

interface ReviewingSettings {
  audioControls: { key: string; default: boolean }
  autoPlayAudio: { key: string; default: boolean }
  alignAudioButtonsRight: {
    key: string
    default: boolean
  }
  autoPlayAudioDelay: {
    key: string
    valueType: string
    default: number
  }
}

export interface DefaultSettings extends Record<string, unknown> {
  darkTheme: boolean
  general: GeneralSettings
  reviewing: ReviewingSettings
}

export type StorageKey =
  | 'darkTheme'
  | 'note.add.lastDeck'
  | 'note.add.lastModel'
  | 'deck.options.new.perDay'
  | 'deck.options.rev.perDay'
  | 'deck.options.new.ignoreReviewLimit'
  | 'deck.options.new.steps'
  | 'deck.options.new.order'
  | 'deck.options.lapse.steps'
  | 'deck.options.lapse.leechThreshold'
  | 'deck.options.lapse.leechAction'
  | 'setting.reviewing.audioControls'
  | 'setting.reviewing.autoPlayAudio'
  | 'setting.reviewing.autoPlayAudioDelay'
  | 'setting.reviewing.alignAudioButtonsRight'
  | 'setting.general.vibrate'
  | 'setting.general.language'
  | 'testing.timeOffset'
  | 'testing.debugging'

export const defaultSettings: DefaultSettings = {
  darkTheme: true,
  // to not take this deck key. only for testing. is in wankidb
  deck: { options: { new: { perDay: { valueType: 'number' } } } },
  testing: {
    timeOffset: { key: 'testing.timeOffset', valueType: 'number', default: 0 },
    debugging: false,
  },
  general: {
    fetchSync: false,
    automaticSync: false,
    displaySync: false,
    shareFeature: false,
    blinkLight: false,
    vibrate: { key: 'setting.general.vibrate', default: true },
    language: { key: 'setting.general.language', default: 'en' },
    useCard: {
      default: 'current-deck',
      items: [{ text: 'Use current deck', value: 'current-deck' }],
    },
  },
  reviewing: {
    audioControls: { key: 'setting.reviewing.audioControls', default: true },
    autoPlayAudio: { key: 'setting.reviewing.autoPlayAudio', default: true },
    alignAudioButtonsRight: {
      key: 'setting.reviewing.alignAudioButtonsRight',
      default: true,
    },
    autoPlayAudioDelay: {
      key: 'setting.reviewing.autoPlayAudioDelay',
      valueType: 'number',
      default: 600,
    },
  },
} as const
