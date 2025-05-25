<template>
  <BaseModal
    no-gutters
    :model-value="modelValue"
    :title="title"
    @close="$emit('close')"
  >
    <InputRadio :items="radioItems" :value="computedValue" @item="onItem" />
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import InputRadio from '@/components/InputRadio.vue'
import { refstorage } from '@/store/globalstate'

interface RadioItem {
  value: string
  text: string
  [key: string]: any
}

interface Props {
  modelValue?: boolean
  title?: string
  radioItems?: RadioItem[]
  defaultValue?: string | null
  storageKey?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
  title: '',
  radioItems: () => [],
  defaultValue: null,
  storageKey: null,
})

const emit = defineEmits<{
  close: []
}>()

const computedValue = computed(() => {
  return refstorage.get(props.storageKey, props.defaultValue)
})

function onItem(item: RadioItem): void {
  if (props.storageKey) {
    refstorage.set(props.storageKey, item.value)
  }

  setTimeout(() => {
    emit('close')
  }, 200)
}
</script>
