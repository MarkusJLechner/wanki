<template>
  <div class="flex flex-col">
    <h1 class="-mb-2 px-4 pt-2 font-bold text-blue-700 dark:text-blue-300">
      {{ value }}
    </h1>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value?: string
}

withDefaults(defineProps<Props>(), {
  value: '',
})
</script>
