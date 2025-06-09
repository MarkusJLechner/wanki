<template>
  <BaseModal
    :confirm="confirm"
    no-gutters
    :model-value="show"
    :title="title"
    content-class="px-3"
    @confirm="emit('confirm', modelValue || '')"
    @close="emit('close')"
  >
    <InputTextField
      autofocus
      :type="type || 'text'"
      :label="label"
      :placeholder="placeholder"
      :model-value="modelValue"
      @enter="onConfirm"
      @input="onInput"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/BaseModal.vue'
import InputTextField from '@/components/InputTextField.vue'
import type { ModalTextfieldProps } from './ModalTextfield.ts'

const props = withDefaults(defineProps<ModalTextfieldProps>(), {
  show: true,
  title: '',
  type: null,
  label: 'text',
  placeholder: 'text',
  confirm: false,
})

const modelValue = defineModel<string | number>()

const emit = defineEmits<{
  close: []
  confirm: [value: string]
}>()

function onInput(event: Event): void {
  modelValue.value = (event.target as HTMLInputElement).value
}

function onConfirm(): void {
  if (props.confirm) {
    emit('confirm', modelValue.value || '')
  }
  emit('close')
}
</script>
