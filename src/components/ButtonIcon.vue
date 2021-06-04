<template>
  <button class="w-12 h-12 dark:text-white">
    <i :class="icon"></i>
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
