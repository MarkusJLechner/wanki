function setPosition(el, binding) {
  const id = binding.value + window.location.hash
  let storedPosition = localStorage.getItem(id)
  if (storedPosition) {
    storedPosition = JSON.parse(storedPosition)
    el.scrollLeft = storedPosition.left
    el.scrollTop = storedPosition.top
  }
}

export default {
  created(el, binding, vnode, prevVnode) {
    console.log('created')
  },
  beforeUpdate() {
    console.log('beforeUpdate')
  },
  updated(el, binding) {
    setPosition(el, binding)
    const vm = binding.instance
    console.log(vm)
  },
  beforeUnmount() {
    console.log('beforeUnmount')
  },
  unmounted() {
    console.log('unmounted')
  },

  beforeMount(el, binding) {
    const id = binding.value
    el.addEventListener(
      'scroll',
      function (event) {
        localStorage.setItem(
          id + window.location.hash,
          JSON.stringify({
            left: event.target.scrollLeft,
            top: event.target.scrollTop,
          }),
        )
        event.target.setAttribute(
          'data-vue-keep-scroll-position',
          event.target.scrollLeft + '-' + event.target.scrollTop,
        )
      },
      { passive: true },
    )
  },

  mounted(el, binding) {
    setPosition(el, binding)
  },
}
