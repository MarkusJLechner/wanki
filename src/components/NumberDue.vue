<template>
  <div
    class="px-1"
    :class="{
      'text-gray-800': value === 0,
      'text-blue-300': value > 0 && color === 'blue',
      'text-red-300': value > 0 && color === 'red',
      'text-green-300': value > 0 && color === 'green',
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
  },
}
</script>
