import { ObjectDirective } from 'vue'

export default {
  mounted(el: HTMLElement) {
    const inputEl = el.querySelector('input')
    if (inputEl) {
      inputEl.focus()
    }
    // todo add option
    // el.select()
  },
} as ObjectDirective
