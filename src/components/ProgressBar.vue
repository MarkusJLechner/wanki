<template>
  <div class="relative pt-1 mb-3">
    <div class="flex mb-2 items-center justify-between">
      <div>
        <span
          class="
            text-xs
            font-semibold
            inline-block
            py-1
            px-2
            uppercase
            rounded-full
          "
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
          class="text-xs font-semibold inline-block"
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
      class="overflow-hidden h-2 mb-1 text-xs flex rounded-sm"
      :class="{
        'bg-yellow-200': computedColor === 'yellow',
        'bg-pink-200': computedColor === 'pink',
        'bg-red-200': computedColor === 'red',
        'bg-green-200': computedColor === 'green',
      }"
    >
      <div
        :style="`width: ${progress}%`"
        class="
          transition-all
          shadow-none
          flex flex-col
          text-center
          whitespace-nowrap
          text-white
          justify-center
        "
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
        class="text-xs block py-1 px-2 uppercase"
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

<script>
import LoadingIcon from '@/components/LoadingIcon.vue'
export default {
  name: 'ProgressBar',
  components: { LoadingIcon },
  props: {
    label: {
      type: String,
      default: 'In Progress',
    },

    value: {
      type: Number,
      default: 0,
    },

    tasks: {
      type: Array,
      default: () => [],
    },

    color: {
      type: String,
      default: 'yellow',
      validator(value) {
        return ['red', 'pink', 'yellow', 'green'].indexOf(value) !== -1
      },
    },

    total: {
      type: Number,
      default: 10,
    },
  },

  computed: {
    computedColor() {
      if (!this.inProgress) {
        return 'green'
      }
      return this.color
    },

    inProgress() {
      return this.progress < 100
    },

    progress() {
      if (this.total === 0) {
        return 0
      }
      let progress = Math.round((this.value / this.total) * 100)
      if (Number.isNaN(this.value / this.total)) {
        progress = 0
      }
      return progress
    },
  },
}
</script>

<style scoped></style>
