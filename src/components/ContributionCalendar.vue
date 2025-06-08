<template>
  <div class="overflow-x-auto">
    <div class="grid grid-flow-col grid-rows-7 gap-1">
      <div
        v-for="day in days"
        :key="day.date.getTime()"
        class="h-3 w-3 rounded"
        :title="tooltip(day)"
        :class="colorClass(day.count)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Day {
  date: Date
  count: number
}

const props = defineProps<{ days: Day[] }>()

const maxCount = computed(() => Math.max(0, ...props.days.map((d) => d.count)))

function colorClass(count: number): string {
  if (count === 0) return 'bg-gray-200 dark:bg-gray-700'
  const level = Math.ceil((count / maxCount.value) * 4)
  switch (level) {
    case 1:
      return 'bg-green-200'
    case 2:
      return 'bg-green-400'
    case 3:
      return 'bg-green-600'
    default:
      return 'bg-green-800'
  }
}

function tooltip(day: Day): string {
  return `${day.date.toLocaleDateString()}: ${day.count} review${
    day.count === 1 ? '' : 's'
  }`
}
</script>

<style scoped></style>
