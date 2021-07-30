export const defaultSettings = {
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
}
