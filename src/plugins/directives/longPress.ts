import { DirectiveBinding, ObjectDirective } from 'vue'

const PRESS_TIMEOUT = 500

export default {
  mounted(
    el: HTMLElement,
    { value }: DirectiveBinding<(e: MouseEvent | TouchEvent) => void>,
  ) {
    if (typeof value !== 'function') {
      console.warn(`Expect a function, got ${value}`)
      return
    }

    let pressTimer: number | null = null
    let onLongPress = false

    let ix = 0
    let iy = 0
    let dx = 0
    let dy = 0
    const thresholdMove = 10

    const start = (e: MouseEvent | TouchEvent) => {
      ix = 'clientX' in e ? e.clientX : (e.touches && e.touches[0].clientX) || 0
      iy = 'clientY' in e ? e.clientY : (e.touches && e.touches[0].clientY) || 0
      dx = ix
      dy = iy
      if (
        'type' in e &&
        e.type === 'click' &&
        'button' in e &&
        e.button !== 0
      ) {
        return
      }

      if (pressTimer === null) {
        pressTimer = window.setTimeout(() => {
          if (
            Math.abs(ix - dx) > thresholdMove ||
            Math.abs(iy - dy) > thresholdMove
          ) {
            clearTimeout(pressTimer as number)
            pressTimer = null
            return
          }
          onLongPress = true
          value(e)
        }, PRESS_TIMEOUT)
      }
    }

    const move = (e: MouseEvent | TouchEvent) => {
      dx = 'clientX' in e ? e.clientX : (e.touches && e.touches[0].clientX) || 0
      dy = 'clientY' in e ? e.clientY : (e.touches && e.touches[0].clientY) || 0
    }

    const cancel = (e: Event) => {
      if (onLongPress) {
        e.stopPropagation()
        e.preventDefault()
      }

      if (pressTimer !== null) {
        clearTimeout(pressTimer)
        onLongPress = false
        pressTimer = null
      }
    }

    ;['mousedown', 'touchstart'].forEach((e) =>
      el.addEventListener(e, start as EventListener, { passive: true }),
    )
    ;['mousemove', 'touchmove'].forEach((e) =>
      el.addEventListener(e, move as EventListener, { passive: true }),
    )
    ;['click', 'mouseout', 'touchend', 'touchcancel'].forEach((e) =>
      el.addEventListener(e, cancel),
    )
  },
} as ObjectDirective
