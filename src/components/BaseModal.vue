<template>
  <transition name="fade" appear>
    <div
      v-if="modelValue"
      class="
        fixed
        z-20
        inset-0
        bg-gray-900/50
        transition-opacity
        backdrop-grayscale
      "
      aria-hidden="true"
      @click.stop="onClose"
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
          @click.stop="onClose"
        ></div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-full"
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
            class="overflow-y-auto grow"
            :class="{ 'p-4': !noGutters, [contentClass]: !!contentClass }"
          >
            <slot />
          </div>

          <ButtonActions
            :confirm="confirm"
            :actions="actions"
            :disable-confirm="disableConfirm"
            :cancel-text="cancelText"
            :loading="loading"
            @close="onClose"
            @confirm="onConfirm"
            @click:action="onAction"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import ButtonActions from '@/components/ButtonActions.vue'
import { modalOpened } from '@/store/globalstate.js'
import { onBeforeRouteLeave } from 'vue-router'

export default {
  components: { ButtonActions },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: '',
    },

    cancelText: {
      type: [String, Function],
      default: undefined,
    },

    noGutters: {
      type: Boolean,
      default: false,
    },

    confirm: {
      type: [Boolean, String],
      default: undefined,
    },

    contentClass: {
      type: String,
      default: '',
    },

    disableConfirm: {
      type: Boolean,
      default: false,
    },

    actions: {
      type: Array,
      default: undefined,
    },
  },

  emits: [
    'click:action',
    'confirm',
    'open',
    'close',
    'update:modelValue',
    'visible',
  ],

  data() {
    return {
      show: false,
    }
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        this.show = newValue
        this.$emit('visible', newValue)
        modalOpened.value = newValue
      },
    },
  },

  mounted() {
    onBeforeRouteLeave(() => {
      if (this.show) {
        this.onClose()
        return false
      }

      return true
    })
  },

  methods: {
    open() {
      this.$emit('open')
      this.$emit('update:modelValue', true)
      this.show = true
    },

    onClose() {
      if (this.loading) {
        return
      }

      this.$emit('close')
      this.closeModal()
    },

    onConfirm() {
      this.$emit('confirm')
    },

    closeModal() {
      this.$emit('update:modelValue', false)
      this.show = false
    },

    onAction(action) {
      this.$emit('click:action', action)
    },
  },
}
</script>
