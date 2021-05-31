export const defaultSettings = {
  general: {
    fetchSync: false,
    automaticSync: false,
    displaySync: false,
    shareFeature: false,
    blinkLight: false,
    vibrate: { key: 'setting/general/vibrate', default: true },
    useCard: {
      default: 'current-deck',
      items: [{ text: 'Use current deck', value: 'current-deck' }],
    },
  },
}
