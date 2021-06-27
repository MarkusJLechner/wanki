<template>
  <div
    v-if="tasks.length"
    class="
      backdrop-blur-[4px] backdrop-filter
      bg-gray-700
      text-sm
      pointer-events-none
      bg-opacity-40
      fixed
      rounded-tl-lg
      z-30
      bottom-0
      right-0
      px-5
      py-2
    "
  >
    <div
      v-for="(task, index) in tasks"
      :key="index"
      class="text-right py-1"
      :class="{ 'text-yellow-200': task.color === 'yellow' }"
    >
      {{ task.text }}
      <loading-icon v-if="task.loading" class="ml-1" />
    </div>
  </div>
</template>

<script>
import LoadingIcon from '@/components/LoadingIcon.vue'

export default {
  name: 'BackgroundTask',
  components: { LoadingIcon },
  data() {
    return {
      tasks: [],
    }
  },

  async mounted() {
    document.addEventListener('background/task', this.updateTask)
  },

  beforeUnmount() {
    document.removeEventListener('background/task', this.updateTask)
  },

  methods: {
    updateTask(event) {
      const task = event.detail
      if (task.remove) {
        this.tasks = this.tasks.filter(
          (t) => t.id !== task.id && t.unique !== task.unique,
        )
        return
      }

      this.tasks = [...this.tasks, task]
    },
  },
}
</script>

<style scoped></style>
