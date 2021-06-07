const PRESS_TIMEOUT = 300

export default {
  mounted(el, { value }, vnode) {
    if (typeof value !== 'function') {
      console.warn(`Expect a function, got ${value}`)
      return
    }

    let pressTimer = null

    const start = (e) => {
      // e.stopPropagation()
      // e.preventDefault()
      if (e.type === 'click' && e.button !== 0) {
        return
      }

      if (pressTimer === null) {
        pressTimer = setTimeout(() => value(e), PRESS_TIMEOUT)
      }
    }

    const cancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }

    ;['mousedown', 'touchstart'].forEach((e) => el.addEventListener(e, start))
    ;['click', 'mouseout', 'touchend', 'touchcancel'].forEach((e) =>
      el.addEventListener(e, cancel),
    )
  },
}
