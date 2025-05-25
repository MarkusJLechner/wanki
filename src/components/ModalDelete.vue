<template>
  <BaseModal
    :actions="actions"
    :model-value="modelValue"
    :title="title"
    @close="$emit('close')"
  >
    <slot>Are you sure?</slot>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/BaseModal.vue'

interface Action {
  type?: string;
  text?: string;
  emit?: string;
}

interface Props {
  modelValue?: boolean;
  title?: string;
  items?: Record<string, any> | null;
  actions?: Action[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: 'Delete',
  items: null,
  actions: () => [
    {
      type: 'spacer',
    },
    {
      text: 'Cancel',
      emit: 'close',
    },
    {
      text: 'Delete',
      emit: 'confirm',
    },
  ]
})

const emit = defineEmits<{
  item: [item: Record<string, any>]
  close: []
}>()

function onClickItem(item: Record<string, any>): void {
  emit('item', item)
}
</script>
