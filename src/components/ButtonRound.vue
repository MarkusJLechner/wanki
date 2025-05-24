<template>
  <div
    v-ripple
    class="
      inline-flex
      justify-center
      items-center
      shadow-md
      bg-gray-400
      rounded-full
      border-white
      text-gray-900
      dark:text-white
      dark:bg-blue-500
    "
    :class="computedClass"
  >
    <i :class="{ [icon]: icon, [computedSize]: computedSize }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  small?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  small: false,
  icon: 'fas fa-plus'
})

const computedSize = computed(() => {
  if (props.small) {
    return 'font-md'
  }
  return 'font-lg'
})

const computedClass = computed(() => {
  if (props.small) {
    return 'h-11 w-11 m-2'
  }
  return 'h-14 w-14 m-4'
})
</script>
