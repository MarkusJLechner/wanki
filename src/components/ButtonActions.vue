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

<script setup lang="ts">
import { computed } from 'vue'
import Spacer from '@/components/Spacer.vue'
import Button from '@/components/Button.vue'

interface Action {
  type?: string
  text?: string | (() => string)
  emit?: string
  [key: string]: any
}

interface Props {
  confirm?: boolean | string
  disableConfirm?: boolean
  loading?: boolean
  confirmText?: string
  cancelText?: string | (() => string)
  actions?: Action[]
}

const props = withDefaults(defineProps<Props>(), {
  confirm: false,
  disableConfirm: false,
  loading: true,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
})

const emit = defineEmits<{
  (e: 'click:action', action: Action): void
  (e: 'action', action: Action): void
  (e: 'confirm', action: Action): void
  (e: 'close', action: Action): void
}>()

const defaultActions = computed<Action[]>(() => [
  { type: 'spacer' },
  {
    text: () =>
      typeof props.cancelText === 'function'
        ? props.cancelText()
        : props.cancelText,
    emit: 'close',
  },
])

const baseActions = computed<Action[]>(() => props.actions?.length ? props.actions : defaultActions.value)

const computedActions = computed<Action[]>(() => {
  if (props.confirm) {
    return [
      ...baseActions.value.map((a) => {
        const action = { ...a }
        if (action.emit === 'close') {
          action.text =
            typeof props.cancelText === 'function'
              ? props.cancelText
              : () => props.cancelText
        }
        return action
      }),
      {
        text:
          typeof props.confirm === 'string'
            ? props.confirm
            : props.confirmText,
        emit: 'confirm',
      },
    ]
  }
  return baseActions.value
})

const canAction = (action: Action): boolean => {
  if (props.loading && props.confirm) {
    return action.emit === 'confirm'
  }

  if (props.loading && !props.confirm) {
    return action.emit === 'close'
  }

  return true
}

const getValue = (obj: any): any => {
  return typeof obj === 'function' ? obj() : obj
}

const getComponent = (action: Action): any => {
  return action.type === 'spacer' ? Spacer : Button
}

const isDisabled = (action: Action): boolean => {
  return action.emit === 'confirm' && props.disableConfirm
}

const onClick = (action: Action): void => {
  if (isDisabled(action)) return

  if (['close', 'confirm'].includes(action.emit || '')) {
    emit(action.emit as 'close' | 'confirm', action)
  }

  emit('click:action', action)
}
</script>
