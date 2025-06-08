<template>
  <div class="flex h-32 items-end space-x-1">
    <div
      v-for="(v, i) in values"
      :key="i"
      class="flex-1 rounded bg-blue-500 dark:bg-blue-400"
      :style="{ height: `${(v / max) * 100}%` }"
      :title="v.toString()"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ values: number[] }>()

const max = computed(() => Math.max(1, ...props.values))
</script>

<style scoped></style>
