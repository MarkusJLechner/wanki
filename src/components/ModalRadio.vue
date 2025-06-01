<template>
  <BaseModal
    no-gutters
    :model-value="show"
    :title="title"
    @close="$emit('close')"
  >
    <InputRadio :items="radioItems" :value="modelValue" @item="onItem" />
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/BaseModal.vue'
import InputRadio from '@/components/InputRadio.vue'

interface RadioItem {
  value: string | number
  text: string
  [key: string]: any
}

interface Props {
  show?: boolean
  title?: string
  radioItems?: RadioItem[]
}

const modelValue = defineModel<string | number>()

withDefaults(defineProps<Props>(), {
  show: true,
  title: '',
  radioItems: () => [],
})

const emit = defineEmits<{
  item: [RadioItem]
  close: []
}>()

function onItem(item: RadioItem): void {
  modelValue.value = item.value

  emit('item', item)

  console.log({ item })

  setTimeout(() => {
    emit('close')
  }, 200)
}
</script>
