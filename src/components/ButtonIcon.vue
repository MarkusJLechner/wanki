<template>
  <button v-ripple class="w-12 h-12 dark:text-white relative rounded-full">
    <i :class="icon"></i>
    <slot name="content" />
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: 'far fa-sun',
    },
  },
}
</script>
