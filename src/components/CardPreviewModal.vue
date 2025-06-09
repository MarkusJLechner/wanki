<template>
  <BaseModal
    :model-value="modelValue"
    title="Preview"
    fullscreen
    no-gutters
    @close="onClose"
  >
    <div class="flex min-h-full flex-col">
      <div class="preview relative grow">
        <ReviewContainer :show-answer="showAnswer" :card="card" />
      </div>
      <ButtonsReview
        class="z-20"
        :show-rating="showAnswer"
        @show="onShow"
        @rating="onRating"
      />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import ReviewContainer from '@/components/ReviewContainer.vue'
import ButtonsReview from '@/components/ButtonsReview.vue'

interface Props {
  modelValue: boolean
  card: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  show: []
  rating: [value: number]
}>()

const showAnswer = ref(false)

const onClose = () => {
  emit('update:modelValue', false)
  showAnswer.value = false
}

const onShow = () => {
  showAnswer.value = true
  emit('show')
}

const onRating = (value: number) => {
  emit('rating', value)
}
</script>
