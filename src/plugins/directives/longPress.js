const PRESS_TIMEOUT = 300

export default {
  mounted(el, { value }, vnode) {
    if (typeof value !== 'function') {
      console.warn(`Expect a function, got ${value}`)
      return
    }

    let pressTimer = null
    let onLongPress = false

    const start = (e) => {
      if (e.type === 'click' && e.button !== 0) {
        return
      }

      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          onLongPress = true
          value(e)
        }, PRESS_TIMEOUT)
      }
    }

    const cancel = (e) => {
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

    document.addEventListener('reset-long-press', cancel, { passive: true })
    ;['mousedown', 'touchstart'].forEach((e) => el.addEventListener(e, start))
    ;['click', 'mouseout', 'touchend', 'touchcancel'].forEach((e) =>
      el.addEventListener(e, cancel),
    )
  },
}
