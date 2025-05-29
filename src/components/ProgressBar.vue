<template>
  <div class="relative mb-3 pt-1">
    <div class="mb-2 flex items-center justify-between">
      <div>
        <span
          class="inline-block rounded-full px-2 py-1 text-xs font-semibold uppercase"
          :class="{
            'bg-yellow-200 text-yellow-900': computedColor === 'yellow',
            'bg-pink-200 text-pink-900': computedColor === 'pink',
            'bg-red-200 text-red-900': computedColor === 'red',
            'bg-green-200 text-green-900': computedColor === 'green',
          }"
        >
          {{ label }}
          <LoadingIcon v-if="inProgress" class="mx-1" />
        </span>
      </div>
      <div class="text-right">
        <span
          class="inline-block text-xs font-semibold"
          :class="{
            'text-yellow-300': computedColor === 'yellow',
            'text-pink-300': computedColor === 'pink',
            'text-red-300': computedColor === 'red',
            'text-green-300': computedColor === 'green',
          }"
        >
          {{ progress }}%
        </span>
      </div>
    </div>
    <div
      class="mb-1 flex h-2 overflow-hidden rounded-sm text-xs"
      :class="{
        'bg-yellow-200': computedColor === 'yellow',
        'bg-pink-200': computedColor === 'pink',
        'bg-red-200': computedColor === 'red',
        'bg-green-200': computedColor === 'green',
      }"
    >
      <div
        :style="`width: ${progress}%`"
        class="flex flex-col justify-center text-center whitespace-nowrap text-white shadow-none transition-all"
        :class="{
          'bg-yellow-500': computedColor === 'yellow',
          'bg-pink-500': computedColor === 'pink',
          'bg-red-500': computedColor === 'red',
          'bg-green-500': computedColor === 'green',
        }"
      />
    </div>
    <div>
      <span
        v-for="(task, index) in tasks"
        :key="index"
        class="block px-2 py-1 text-xs uppercase"
        :class="{
          'text-gray-300': computedColor === 'pink',
        }"
      >
        {{ task }}
        <LoadingIcon v-if="inProgress" class="mx-1" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LoadingIcon from '@/components/LoadingIcon.vue'

type ColorType = 'red' | 'pink' | 'yellow' | 'green'

interface Props {
  label?: string
  value?: number
  tasks?: string[]
  color?: ColorType
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'In Progress',
  value: 0,
  tasks: () => [],
  color: 'yellow',
  total: 10,
})

const progress = computed((): number => {
  if (props.total === 0) {
    return 0
  }
  let progressValue = Math.round((props.value / props.total) * 100)
  if (Number.isNaN(props.value / props.total)) {
    progressValue = 0
  }
  return progressValue
})

const inProgress = computed((): boolean => {
  return progress.value < 100
})

const computedColor = computed((): ColorType => {
  if (!inProgress.value) {
    return 'green'
  }
  return props.color
})
</script>

<style scoped></style>
