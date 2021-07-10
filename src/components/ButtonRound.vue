<template>
  <div
    v-ripple
    class="
      inline-flex
      justify-center
      items-center
      shadow-md
      bg-blue-500 bg-opacity-70
      rounded-full
      border-white
      backdrop-filter backdrop-blur-sm
    "
    :class="computedClass"
  >
    <i :class="{ [icon]: icon, [computedSize]: computedSize }" />
  </div>
</template>

<script>
export default {
  name: 'ButtonRound',

  props: {
    small: {
      type: Boolean,
      default: false,
    },

    icon: {
      type: String,
      default: 'fas fa-plus',
    },
  },

  computed: {
    computedSize() {
      if (this.small) {
        return 'font-md'
      }
      return 'font-lg'
    },

    computedClass() {
      if (this.small) {
        return 'h-11 w-11 m-2'
      }
      return 'h-14 w-14 m-4'
    },
  },
}
</script>
