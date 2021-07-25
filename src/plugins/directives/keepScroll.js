function setPosition(el, binding) {
  if (binding.value === null) {
    return
  }
  const id = binding.value + window.location.hash
  let storedPosition = localStorage.getItem(id)
  if (storedPosition) {
    storedPosition = JSON.parse(storedPosition)
    el.scrollLeft = storedPosition.left
    el.scrollTop = storedPosition.top
  }
}

let scrollFn

export default {
  updated(el, binding) {
    setPosition(el, binding)
  },

  beforeMount(el, binding) {
    if (binding.value === null) {
      return
    }
    const id = binding.value

    scrollFn = (event) => {
      localStorage.setItem(
        id + window.location.hash,
        JSON.stringify({
          left: event.target.scrollLeft,
          top: event.target.scrollTop,
        }),
      )
    }

    el.addEventListener('scroll', scrollFn, { passive: true })
  },

  unmounted(el) {
    if (scrollFn) {
      el.removeEventListener('scroll', scrollFn)
    }
  },

  mounted(el, binding) {
    setPosition(el, binding)
  },
}
