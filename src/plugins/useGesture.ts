import { ref, onMounted, onUnmounted } from 'vue'

export type Direction = 'left' | 'right' | 'up' | 'down'

interface SwipeOptions {
  direction: Direction
  threshold?: number
  checkScroll?: boolean
  onTrigger: () => void
  target?: HTMLElement
}

export function useSwipeGesture(options: SwipeOptions) {
  const progress = ref(0)
  const active = ref(false)
  let startX = 0
  let startY = 0

  const onStart = (e: TouchEvent | MouseEvent) => {
    startX = 'touches' in e ? e.touches[0].clientX : e.clientX
    startY = 'touches' in e ? e.touches[0].clientY : e.clientY
    active.value = true
    progress.value = 0
  }

  const atBoundary = (dir: 'up' | 'down'): boolean => {
    const el = document.scrollingElement
    if (!el) return true
    if (dir === 'up') return el.scrollTop <= 0
    return el.scrollTop >= el.scrollHeight - el.clientHeight
  }

  const onMove = (e: TouchEvent | MouseEvent) => {
    if (!active.value) return
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY
    let delta = 0

    if (options.direction === 'left' || options.direction === 'right') {
      delta = x - startX
      if (options.direction === 'left') delta = -delta
    } else {
      if (options.checkScroll && !atBoundary(options.direction)) {
        active.value = false
        progress.value = 0
        return
      }
      delta = y - startY
      if (options.direction === 'up') delta = -delta
    }

    progress.value = Math.max(0, delta / (options.threshold ?? 80))
  }

  const onEnd = () => {
    if (active.value && progress.value >= 1) {
      options.onTrigger()
    }
    active.value = false
    progress.value = 0
  }

  onMounted(() => {
    const target = options.target || document
    ;['mousedown', 'touchstart'].forEach((e) =>
      target.addEventListener(e, onStart, { passive: true }),
    )
    ;['mousemove', 'touchmove'].forEach((e) =>
      target.addEventListener(e, onMove, { passive: true }),
    )
    ;['mouseup', 'touchend', 'touchcancel'].forEach((e) =>
      target.addEventListener(e, onEnd),
    )
  })

  onUnmounted(() => {
    const target = options.target || document
    ;['mousedown', 'touchstart'].forEach((e) =>
      target.removeEventListener(e, onStart),
    )
    ;['mousemove', 'touchmove'].forEach((e) =>
      target.removeEventListener(e, onMove),
    )
    ;['mouseup', 'touchend', 'touchcancel'].forEach((e) =>
      target.removeEventListener(e, onEnd),
    )
  })

  return { progress, active }
}
