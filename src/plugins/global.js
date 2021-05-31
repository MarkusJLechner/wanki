import { refstorage } from '../store/globalstate.js'
import { defaultSettings } from './defaultSettings.js'

export const vibrate = (pattern = 50) => {
  if (refstorage.getSetting(defaultSettings.general.vibrate)) {
    navigator.vibrate(pattern)
  }
}
