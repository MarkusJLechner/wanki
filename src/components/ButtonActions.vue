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
import { useI18n } from 'vue-i18n'
import Spacer from '@/components/Spacer.vue'
import Button from '@/components/Button.vue'
import type { Action } from '@/components/ButtonActions'

const { t } = useI18n()

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
  confirmText: undefined,
  cancelText: undefined,
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

const baseActions = computed<Action[]>(() =>
  props.actions?.length ? props.actions : defaultActions.value,
)

const computedActions = computed<Action[]>(() => {
  if (props.confirm) {
    return [
      ...baseActions.value.map((a) => {
        const action = { ...a }
        if (action.emit === 'close') {
          action.text = () => {
            return typeof props.cancelText === 'function'
              ? props.cancelText()
              : (props.cancelText ?? t('Cancel'))
          }
        }
        return action
      }),
      {
        text:
          typeof props.confirm === 'string'
            ? props.confirm
            : (props.confirmText ?? t('Confirm')),
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

const getValue = (
  obj: unknown,
): string | number | boolean | object | null | undefined => {
  if (typeof obj === 'function') {
    return (obj as () => string)()
  }
  return obj as string | number | boolean | object | null | undefined
}

// Using a more generic component type
const getComponent = (action: Action) => {
  return action.type === 'spacer' ? Spacer : Button
}

const isDisabled = (action: Action): boolean => {
  return action.emit === 'confirm' && props.disableConfirm
}

const onClick = (action: Action): void => {
  if (isDisabled(action)) return

  if (action.emit === 'close') {
    emit('close', action)
  } else if (action.emit === 'confirm') {
    emit('confirm', action)
  }

  emit('click:action', action)
}
</script>
