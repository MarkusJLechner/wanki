<template>
  <div
    class="px-1"
    :class="{
      underline,
      'text-gray-800 dark:text-gray-800': value === 0 && highContrast,
      'text-gray-500 dark:text-gray-500': value === 0 && !highContrast,
      'text-blue-500 dark:text-blue-300': value > 0 && color === 'blue',
      'text-red-500 dark:text-red-300': value > 0 && color === 'red',
      'text-green-600 dark:text-green-300': value > 0 && color === 'green',
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
  highContrast: true,
})
</script>
