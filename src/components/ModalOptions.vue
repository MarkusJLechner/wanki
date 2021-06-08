<template>
  <BaseModal
    :model-value="!!modelValue"
    :title="modelValue?.text"
    @close="$emit('close')"
  >
    <slot> </slot>
    <List dense no-separation :value="value" @item="onClickItem" />
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/BaseModal.vue'
import List from '@/components/List.vue'
export default {
  components: { List, BaseModal },

  props: {
    modelValue: {
      type: Object,
      default: null,
    },
  },
}
</script>

<style scoped></style>
