<template>
  <div
    class="px-1"
    :class="{
      underline,
      'dark:text-gray-800 text-gray-800': value === 0 && highContrast,
      'dark:text-gray-500 text-gray-500': value === 0 && !highContrast,
      'dark:text-blue-300 text-blue-500': value > 0 && color === 'blue',
      'dark:text-red-300 text-red-500': value > 0 && color === 'red',
      'dark:text-green-300 text-green-600': value > 0 && color === 'green',
    }"
  >
    {{ value }}
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },

    color: {
      type: String,
      default: 'blue',
    },

    underline: {
      type: Boolean,
      default: false,
    },

    highContrast: {
      type: Boolean,
      default: true,
    },
  },
}
</script>
