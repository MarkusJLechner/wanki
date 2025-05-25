<template>
  <BaseModal
    :model-value="!!modelValue"
    :title="modelValue?.text"
    no-gutters
    @close="$emit('close')"
  >
    <slot> </slot>
    <List dense no-separation :value="items" @item="onClickItem" />
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/BaseModal.vue'
import List from '@/components/List.vue'

interface Props {
  modelValue?: Record<string, any> | null
  items?: Record<string, any> | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  items: null
})

const emit = defineEmits<{
  item: [item: any]
  close: []
}>()

function onClickItem(item: any): void {
  emit('item', item)
}
</script>
