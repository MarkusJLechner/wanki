<template>
  <button
    type="button"
    class="
      mt-3
      inline-flex
      justify-center
      rounded-md
      px-4
      py-2
      m-1
      bg-white
      text-base
      font-medium
      text-gray-700
      dark:text-white
      dark:bg-gray-700
      hover:bg-gray-50
      focus:outline-none
      focus:ring-2 focus:ring-blue-500
    "
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script>
import { vibrate } from '../plugins/global.js'

export default {
  props: {},

  methods: {
    onClick() {
      vibrate()
    },
  },
}
</script>
