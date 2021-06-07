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

<script>
import BaseModal from 'components/BaseModal.vue'
import InputRadio from 'components/InputRadio.vue'
import { refstorage } from 'store/globalstate.js'

export default {
  components: { InputRadio, BaseModal },

  props: {
    modelValue: {
      type: Boolean,
      default: true,
    },

    title: {
      type: String,
      default: '',
    },

    radioItems: {
      type: Array,
      default: () => [],
    },

    defaultValue: {
      type: String,
      default: null,
    },

    storageKey: {
      type: String,
      default: null,
    },
  },

  emits: ['close'],

  computed: {
    computedValue() {
      return refstorage.get(this.storageKey, this.defaultValue)
    },
  },

  methods: {
    onItem(item) {
      if (this.storageKey) {
        refstorage.set(this.storageKey, item.value)
      }

      setTimeout(() => {
        this.$emit('close')
      }, 200)
    },
  },
}
</script>
