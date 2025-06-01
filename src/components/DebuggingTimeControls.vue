<template>
  <div class="fixed z-30 flex flex-col gap-2" :class="positionClass">
    <div class="text-sm text-white">Real time: {{ realDateTime }}</div>
    <div class="text-sm text-white">Current time: {{ currentDateTime }}</div>
    <div class="text-sm text-white">{{ timeDifference }}</div>
    <div class="flex flex-row gap-2">
      <button
        class="rounded-md bg-gray-800 px-2 py-1 text-sm text-white"
        @click="
          () => {
            advanceTime(2 * 3600 * 1000)
            onTimeChange()
          }
        "
      >
        +2h
      </button>
      <button
        class="rounded-md bg-gray-800 px-2 py-1 text-sm text-white"
        @click="
          () => {
            advanceTime(24 * 3600 * 1000)
            onTimeChange()
          }
        "
      >
        +1d
      </button>
      <button
        class="rounded-md bg-red-800 px-2 py-1 text-sm text-white"
        @click="
          () => {
            setTimeOffset(0)
            onTimeChange()
          }
        "
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  advanceTime,
  setTimeOffset,
  nowDate,
  getTimeOffset,
} from '@/plugins/time'

interface Props {
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center'
  onTimeChange?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-left',
  onTimeChange: () => {},
})

const realDateTime = computed(() => {
  return new Date().toLocaleString('de-AT')
})

const currentDateTime = computed(() => {
  return nowDate().toLocaleString('de-AT')
})

const timeDifference = computed(() => {
  const offset = getTimeOffset()
  if (offset === 0) return ''

  const days = Math.floor(Math.abs(offset) / (24 * 3600 * 1000))
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7

  let result = ''
  if (weeks > 0) {
    result += `${weeks}w `
  }
  if (remainingDays > 0 || result === '') {
    result += `${remainingDays}d`
  }

  return result.trim()
})

const positionClass = computed(() => {
  switch (props.position) {
    case 'bottom-left':
      return 'bottom-32 left-2.5'
    case 'bottom-right':
      return 'bottom-32 right-2.5'
    case 'bottom-center':
      return 'bottom-32 left-1/2 transform -translate-x-1/2'
    default:
      return 'bottom-32 left-2.5'
  }
})

function onTimeChange() {
  props.onTimeChange()
}
</script>
