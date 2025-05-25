<template>
  <div
    v-if="tasks.length"
    class="pointer-events-none fixed right-0 bottom-0 z-30 rounded-tl-lg bg-gray-700/40 px-5 py-2 text-sm backdrop-grayscale"
  >
    <div
      v-for="(task, index) in tasks"
      :key="index"
      class="py-1 text-right"
      :class="{ 'text-yellow-200': task.color === 'yellow' }"
    >
      {{ task.text }}
      <LoadingIcon v-if="task.loading" class="ml-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import LoadingIcon from '@/components/LoadingIcon.vue'

interface Task {
  id?: string | number
  unique?: string | number
  text: string
  color?: string
  loading?: boolean
  remove?: boolean
}

const tasks = ref<Task[]>([])

const updateTask = (event: CustomEvent) => {
  const task = event.detail as Task
  if (task.remove) {
    tasks.value = tasks.value.filter(
      (t) => t.id !== task.id && t.unique !== task.unique,
    )
    return
  }

  tasks.value = [...tasks.value, task]
}

onMounted(() => {
  document.addEventListener('background/task', updateTask as EventListener)
})

onBeforeUnmount(() => {
  document.removeEventListener('background/task', updateTask as EventListener)
})
</script>

<style scoped></style>
