const PRESS_TIMEOUT = 300

export default {
  mounted(el, { value }, vnode) {
    if (typeof value !== 'function') {
      console.warn(`Expect a function, got ${value}`)
      return
    }

    let pressTimer = null
    let onLongPress = false

    let ix = 0
    let iy = 0
    let dx = 0
    let dy = 0

    const start = (e) => {
      ix = e.clientX || e.touches[0].clientX
      iy = e.clientY || e.touches[0].clientY
      dx = ix
      dy = iy
      if (e.type === 'click' && e.button !== 0) {
        return
      }

      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          if (Math.abs(ix - dx) > 30 || Math.abs(iy - dy) > 30) {
            clearTimeout(pressTimer)
            pressTimer = null
            return
          }
          onLongPress = true
          value(e)
        }, PRESS_TIMEOUT)
      }
    }

    const move = (e) => {
      dx = e.clientX || e.touches[0].clientX
      dy = e.clientY || e.touches[0].clientY
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
    ;['mousemove', 'touchmove'].forEach((e) => el.addEventListener(e, move))
    ;['click', 'mouseout', 'touchend', 'touchcancel'].forEach((e) =>
      el.addEventListener(e, cancel),
    )
  },
}
