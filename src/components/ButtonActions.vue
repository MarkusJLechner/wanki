<template>
  <div class="flex justify-end">
    <div v-for="(action, index) in computedActions" :key="index">
      <component
        :is="getComponent(action)"
        v-if="canAction(action)"
        :text="getValue(action.text)"
        :loading="loading && action.emit === 'confirm'"
        class="transition-opacity duration-200 ease-in-out"
        :class="{ 'opacity-30': isDisabled(action) }"
        @click="onClick(action)"
      />
    </div>
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

    loading: {
      type: Boolean,
      default: true,
    },

    confirmText: {
      type: String,
      default: 'Confirm',
    },

    cancelText: {
      type: [String, Function],
      default: 'Cancel',
    },

    actions: {
      type: Array,
      default: (props) => {
        return [
          {
            type: 'spacer',
          },
          {
            text: () => props.cancelText,
            emit: 'close',
          },
        ]
      },
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
    canAction(action) {
      if (this.loading && this.confirm) {
        return action.emit === 'confirm'
      }

      if (this.loading && !this.confirm) {
        return action.emit === 'close'
      }

      return true
    },

    getValue(obj) {
      if (typeof obj === 'function') {
        return obj()
      }

      return obj
    },

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
