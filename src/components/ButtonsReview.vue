<template>
  <div
    class="
      select-none
      flex
      fixed
      bottom-0
      w-full
      h-28
      bg-opacity-50
      blur-[15px]
      bg-gray-500
    "
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
        class="flex justify-center items-center text-white"
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
        { text: 'AGAIN', color: 'red', emit: 0 },
        { text: 'HARD', color: 'gray', emit: 1 },
        { text: 'GOOD', color: 'green', emit: 2 },
        { text: 'EASY', color: 'blue', emit: 3 },
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

<style scoped></style>
