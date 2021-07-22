<template>
  <div
    class="
      select-none
      flex
      sticky
      bottom-0
      w-full
      bg-opacity-50 bg-gray-500
      backdrop-filter backdrop-blur
      bg-opacity-30
      review-height
    "
    :class="{
      'bg-black': showRating,
      'bg-gray-500': !showRating,
    }"
  >
    <div
      v-if="!showRating"
      v-ripple
      role="button"
      class="flex justify-center items-center w-full text-white"
      @click="onShow"
    >
      Show Answers
    </div>
    <div v-else class="grid grid-cols-4 w-full justify-items-stretch">
      <div
        v-for="(button, index) in buttons"
        :key="index"
        v-ripple
        role="button"
        class="flex justify-center items-center text-white bg-opacity-50"
        :class="{
          'bg-red-500': button.color === 'red',
          'bg-gray-500': button.color === 'gray',
          'bg-green-500': button.color === 'green',
          'bg-blue-500': button.color === 'blue',
        }"
        @click="onClickRating(button.emit)"
      >
        {{ button.text }}
      </div>
    </div>
  </div>
</template>

<script>
import { Ease } from '@/plugins/conts.js'

export default {
  name: 'ButtonsReview',

  props: {
    showRating: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['show', 'rating'],

  data() {
    return {
      buttons: [
        { text: 'AGAIN', color: 'red', emit: Ease.One },
        { text: 'HARD', color: 'gray', emit: Ease.Two },
        { text: 'GOOD', color: 'green', emit: Ease.Three },
        { text: 'EASY', color: 'blue', emit: Ease.Four },
      ],
    }
  },

  methods: {
    onShow() {
      this.$emit('show')
    },

    onClickRating(value) {
      this.$emit('rating', value)
    },
  },
}
</script>

<style scoped>
.review-height {
  min-height: min(calc(100vw / 4), 6rem);
}
</style>
