<template>
  <div
    class="review-height sticky bottom-0 flex w-full bg-gray-500/50 backdrop-blur-xs select-none"
    :class="{
      'bg-black': showRating,
      'bg-gray-500': !showRating,
    }"
  >
    <div
      v-if="!showRating"
      v-ripple
      role="button"
      class="flex w-full items-center justify-center text-white"
      @click="onShow"
    >
      Show Answers
    </div>
    <div v-else class="grid w-full grid-cols-4 justify-items-stretch">
      <div
        v-for="(button, index) in buttons"
        :key="index"
        v-ripple
        role="button"
        class="flex items-center justify-center text-white"
        :class="{
          'bg-red-500/50': button.color === 'red',
          'bg-gray-500/50': button.color === 'gray',
          'bg-green-500/50': button.color === 'green',
          'bg-blue-500/50': button.color === 'blue',
        }"
        @click="onClickRating(button.emit)"
      >
        {{ button.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Ease } from '@/plugins/consts'

interface Button {
  text: string
  color: 'red' | 'gray' | 'green' | 'blue'
  emit: number
}

interface Props {
  showRating?: boolean
}

withDefaults(defineProps<Props>(), {
  showRating: false,
})

const emit = defineEmits<{
  show: []
  rating: [value: number]
}>()

const buttons = ref<Button[]>([
  { text: 'AGAIN', color: 'red', emit: Ease.One },
  { text: 'HARD', color: 'gray', emit: Ease.Two },
  { text: 'GOOD', color: 'green', emit: Ease.Three },
  { text: 'EASY', color: 'blue', emit: Ease.Four },
])

const onShow = (): void => {
  emit('show')
}

const onClickRating = (value: number): void => {
  emit('rating', value)
}
</script>

<style scoped>
.review-height {
  min-height: min(calc(100vw / 4), 6rem);
}
</style>
