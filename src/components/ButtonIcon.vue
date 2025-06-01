<template>
  <button
    v-ripple
    class="relative h-12 w-12 cursor-pointer rounded-full dark:text-white"
  >
    <i :class="icon"></i>
    <div
      v-if="showDot"
      class="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"
    ></div>
    <slot name="content" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  showDot?: boolean
}

withDefaults(defineProps<Props>(), {
  icon: 'far fa-sun',
  showDot: false,
})
</script>
