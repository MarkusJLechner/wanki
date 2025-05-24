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

<script setup lang="ts">
interface Props {
  value?: number
  color?: string
  underline?: boolean
  highContrast?: boolean
}

withDefaults(defineProps<Props>(), {
  value: 0,
  color: 'blue',
  underline: false,
  highContrast: true
})
</script>
