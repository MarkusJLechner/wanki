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

export interface DefaultSettings {
  darkTheme: boolean
  general: GeneralSettings
  reviewing: ReviewingSettings
}

export const defaultSettings: DefaultSettings = {
  darkTheme: true,
  general: {
    fetchSync: false,
    automaticSync: false,
    displaySync: false,
    shareFeature: false,
    blinkLight: false,
    vibrate: { key: 'setting.general.vibrate', default: true },
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
