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

<script>
import BaseModal from 'components/BaseModal.vue'
import List from 'components/List.vue'

export default {
  components: { List, BaseModal },

  props: {
    modelValue: {
      type: Object,
      default: null,
    },

    items: {
      type: Object,
      default: null,
    },
  },

  emits: ['item', 'close'],

  methods: {
    onClickItem(item) {
      this.$emit('item', item)
    },
  },
}
</script>
