<template>
  <div class="flex justify-end">
    <component
      :is="getComponent(action)"
      v-for="(action, index) in computedActions"
      :key="index"
      :text="action.text"
      class="transition-opacity duration-200 ease-in-out"
      :class="{ 'opacity-30': isDisabled(action) }"
      @click="onClick(action)"
    />
  </div>
</template>

<script>
import Spacer from 'components/Spacer.vue'
import Button from 'components/Button.vue'

export default {
  props: {
    confirm: {
      type: [Boolean, String],
      default: false,
    },

    disableConfirm: {
      type: Boolean,
      default: false,
    },

    confirmText: {
      type: String,
      default: 'Confirm',
    },

    cancelText: {
      type: String,
      default: 'Cancel',
    },

    actions: {
      type: Array,
      default: () => [
        {
          type: 'spacer',
        },
        {
          text: 'Close',
          emit: 'close',
        },
      ],
    },
  },

  emits: ['click:action', 'action', 'confirm', 'close'],

  computed: {
    computedActions() {
      if (this.confirm) {
        return [
          ...this.actions.map((a) => {
            if (this.confirm && a.emit === 'close') {
              a.text = this.cancelText
            }
            return a
          }),
          {
            text:
              typeof this.confirm === 'string'
                ? this.confirm
                : this.confirmText,
            emit: 'confirm',
          },
        ]
      }
      return this.actions
    },
  },

  methods: {
    getComponent(action) {
      switch (action.type) {
        case 'spacer':
          return Spacer
      default:
        return Button
      }
    },

    isDisabled(action) {
      return action.emit === 'confirm' && this.disableConfirm
    },

    onClick(action) {
      if (this.isDisabled(action)) {
        return
      }

      if (['close', 'confirm'].some((a) => a === action.emit)) {
        this.$emit(action.emit, action)
      }

      this.$emit('click:action', action)
    },
  },
}
</script>