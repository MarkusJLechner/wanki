<template>
  <div class="w-full overflow-x-auto">
    <div class="pl-5">
      <div class="grid auto-cols-max grid-flow-col gap-1 text-xs">
        <div v-for="(week, i) in weeks" :key="i" class="w-3">
          <span v-if="showMonthLabel(i)">{{ monthName(week[0].date) }}</span>
        </div>
      </div>
      <div class="flex">
        <div class="mr-1 flex flex-col justify-between text-xs">
          <span class="invisible h-3">-</span>
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
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

const weeks = computed(() => {
  const arr: Day[][] = []
  for (let i = 0; i < props.days.length; i += 7) {
    arr.push(props.days.slice(i, i + 7))
  }
  return arr
})

function showMonthLabel(index: number): boolean {
  const month = weeks.value[index][0].date.getMonth()
  const prevMonth = index > 0 ? weeks.value[index - 1][0].date.getMonth() : -1
  return month !== prevMonth
}

function monthName(d: Date): string {
  return d.toLocaleString(undefined, { month: 'short' })
}

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
