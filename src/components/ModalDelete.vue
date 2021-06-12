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

<script>
import BaseModal from 'components/BaseModal.vue'

export default {
  name: 'ModalDelete',

  components: { BaseModal },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: 'Delete',
    },

    items: {
      type: Object,
      default: null,
    },

    actions: {
      type: Array,
      default: () => [
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
      ],
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
