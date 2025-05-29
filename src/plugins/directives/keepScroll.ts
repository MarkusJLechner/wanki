import { DirectiveBinding, ObjectDirective } from 'vue'

interface ScrollPosition {
  left: number
  top: number
}

function setPosition(el: HTMLElement, binding: DirectiveBinding): void {
  if (binding.value === null) {
    return
  }
  const id = binding.value + window.location.hash
  let storedPosition = localStorage.getItem(id)
  if (storedPosition) {
    storedPosition = JSON.parse(storedPosition) as ScrollPosition
    el.scrollLeft = storedPosition.left
    el.scrollTop = storedPosition.top
  }
}

let scrollFn: ((event: Event) => void) | undefined

export default {
  updated(el: HTMLElement, binding: DirectiveBinding) {
    setPosition(el, binding)
  },

  beforeMount(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.value === null) {
      return
    }
    const id = binding.value

    scrollFn = (event: Event) => {
      const target = event.target as HTMLElement
      localStorage.setItem(
        id + window.location.hash,
        JSON.stringify({
          left: target.scrollLeft,
          top: target.scrollTop,
        }),
      )
    }

    el.addEventListener('scroll', scrollFn, { passive: true })
  },

  unmounted(el: HTMLElement) {
    if (scrollFn) {
      el.removeEventListener('scroll', scrollFn)
    }
  },

  mounted(el: HTMLElement, binding: DirectiveBinding) {
    setPosition(el, binding)
  },
} as ObjectDirective
