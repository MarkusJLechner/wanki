<template>
  <button
    v-ripple
    type="button"
    class="
      mt-3
      inline-flex
      justify-center
      rounded-md
      px-4
      py-2
      m-1
      bg-white
      text-base
      font-medium
      text-gray-700
      dark:text-white
      dark:bg-gray-700
      items-center
      hover:bg-gray-50
      focus:outline-none
      focus:ring-2 focus:ring-blue-500
    "
    style="min-height: 40px"
  >
    <slot>
      <i v-if="loading" class="fas fa-spinner fa-spin" @click.prevent.stop />
      <span v-else>{{ text }}</span>
    </slot>
  </button>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: '',
    },

    loading: {
      type: Boolean,
      default: true,
    },
  },
}
</script>
