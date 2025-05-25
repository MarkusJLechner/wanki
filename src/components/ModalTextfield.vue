<template>
  <BaseModal
    no-gutters
    :model-value="modelValue"
    :title="title"
    content-class="px-3"
    @close="$emit('close')"
  >
    <InputTextField
      autofocus
      :type="type || computedType || 'text'"
      :label="label"
      :placeholder="placeholder"
      :model-value="computedValue"
      @enter="onClose"
      @input="onInput"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { refstorage } from '@/store/globalstate'
import InputTextField from '@/components/InputTextField.vue'

interface RadioItem {
  value: string
  text: string
  [key: string]: any
}

interface Props {
  modelValue?: boolean
  title?: string
  radioItems?: RadioItem[]
  type?: string | null
  label?: string
  placeholder?: string
  defaultValue?: string | null
  storageKey?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
  title: '',
  radioItems: () => [],
  type: null,
  label: 'text',
  placeholder: 'text',
  defaultValue: null,
  storageKey: null
})

const emit = defineEmits<{
  close: []
  'update:inputValue': [value: string]
}>()

const value = ref<string | null>(null)

const computedValue = computed(() => {
  if (props.storageKey) {
    return refstorage.get(props.storageKey)
  }
  return value.value
})

const computedType = computed(() => {
  return refstorage.getValueType(props.storageKey)
})

watch(() => props.modelValue, (newValue) => {
  if (newValue && props.storageKey) {
    value.value = '' + refstorage.get(props.storageKey)
  }
})

function onInput(event: Event): void {
  const val = (event.target as HTMLInputElement).value
  if (props.storageKey) {
    refstorage.set(props.storageKey, val)
  }

  value.value = val

  emit('update:inputValue', val)
}

function onClose(): void {
  emit('close')
}
</script>
