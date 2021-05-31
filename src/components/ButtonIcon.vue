<template>
  <button class="w-12 h-12 dark:text-white" @click="onClick">
    <i :class="icon"></i>
  </button>
</template>

<script>
import { vibrate } from '../plugins/global.js'

export default {
  props: {
    icon: {
      type: String,
      default: 'far fa-sun',
    },
  },

  methods: {
    onClick() {
      vibrate()
    },
  },
}
</script>
