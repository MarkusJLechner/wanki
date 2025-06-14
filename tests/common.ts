import i18n from '../src/plugins/i18n'

export const commonGlobal = {
  plugins: [i18n],
  directives: {
    'long-press': { mounted: () => {} },
    ripple: { mounted: () => {} },
  },
}
