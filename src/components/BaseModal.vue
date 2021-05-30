<template>
  <transition name="fade" appear>
    <div
      v-if="show"
      class="fixed z-10 inset-0 bg-black bg-opacity-60 transition-opacity"
      aria-hidden="true"
      @click.stop="close"
    ></div>
  </transition>
  <transition name="slide-open" appear>
    <div
      v-if="show"
      class="fixed z-20 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="
          flex
          items-center
          justify-center
          min-h-screen
          pt-4
          px-4
          pb-20
          text-center
        "
      >
        <div
          v-if="show"
          class="fixed z-10 inset-0 transition-opacity"
          aria-hidden="true"
          @click.stop="close"
        ></div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="
            z-50
            inline-block
            align-bottom
            dark:bg-gray-700
            bg-white
            dark:text-white
            text-gray-800
            rounded-lg
            text-left
            overflow-hidden
            shadow-xl
            transform
            p-1
            min-w-[20rem]
            transition-all
          "
        >
          <h1 class="px-4 py-2 font-bold">{{ title }}</h1>
          <div class="" @click.stop.prevent>
            <slot />
          </div>
          <div class="flex justify-end">
            <Button @click="close">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Button from './Button.vue'
export default {
  components: { Button },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: '',
    },
  },

  emits: ['close', 'update:modelValue'],

  data() {
    return {
      show: false,
    }
  },

  watch: {
    modelValue(newValue) {
      this.show = newValue
    },
  },

  methods: {
    open() {
      this.$emit('open')
      this.$emit('update:modelValue', true)
      this.show = true
    },

    close() {
      this.$emit('close')
      this.$emit('update:modelValue', false)
      this.show = false
    },
  },
}
</script>

<style scoped>
.slide-open {
  position: fixed;
  top: 0;
  transform: translate(0, 0) rotateX(0deg);
}

.slide-open-enter-active,
.slide-open-leave-active {
  transition: 0.2s;
}

.slide-open-enter-from {
  opacity: 0;
  transform: translate(0, -100px) perspective(700px) rotateX(45deg);
}

.slide-open-leave-to {
  opacity: 0;
  transform: translate(0, 10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
