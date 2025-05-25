<template>
  <button v-ripple class="relative h-12 w-12 rounded-full dark:text-white">
    <i :class="icon"></i>
    <slot name="content" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'far fa-sun',
})
</script>
