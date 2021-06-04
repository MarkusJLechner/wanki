<template>
  <transition name="fade" appear>
    <div
      v-if="modelValue"
      class="fixed z-10 inset-0 bg-black bg-opacity-60 transition-opacity"
      aria-hidden="true"
      @click.stop="close"
    ></div>
  </transition>
  <transition name="slide-open" appear>
    <div
      v-if="modelValue"
      class="fixed z-20 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="
          flex
          h-full
          items-center
          justify-center
          pt-4
          px-4
          pb-20
          text-center
        "
      >
        <div
          v-if="modelValue"
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
            max-h-[85vh]
            relative
            flex flex-col
          "
        >
          <h1 class="px-4 py-2 font-bold">{{ title }}</h1>
          <div
            style="box-shadow: rgb(0 0 0 / 6%) 0 2px 20px 10px inset"
            class="overflow-y-auto flex-grow"
            :class="{ 'p-4': !noGutters }"
            @click.stop.prevent
          >
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

    noGutters: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['close', 'update:modelValue', 'visible'],

  data() {
    return {
      show: false,
    }
  },

  watch: {
    modelValue(newValue) {
      this.show = newValue
      this.$emit('visible', newValue)
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
