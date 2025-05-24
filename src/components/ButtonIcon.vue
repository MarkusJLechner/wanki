<template>
  <button v-ripple class="w-12 h-12 dark:text-white relative rounded-full">
    <i :class="icon"></i>
    <slot name="content" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'far fa-sun'
})
</script>
