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

<script>
import BaseModal from 'components/BaseModal.vue'
import { refstorage } from 'store/globalstate.js'
import InputTextField from '@/components/InputTextField.vue'

export default {
  components: { InputTextField, BaseModal },

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

    type: {
      type: String,
      default: null,
    },

    label: {
      type: String,
      default: 'text',
    },

    placeholder: {
      type: String,
      default: 'text',
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

  emits: ['close', 'update:inputValue'],

  data() {
    return {
      value: null,
    }
  },

  computed: {
    computedValue() {
      if (this.storageKey) {
        return refstorage.get(this.storageKey)
      }

      return this.value
    },

    computedType() {
      return refstorage.getValueType(this.storageKey)
    },
  },

  watch: {
    modelValue(newValue) {
      if (newValue && this.storageKey) {
        this.value = '' + refstorage.get(this.storageKey)
      }
    },
  },

  methods: {
    onInput(event) {
      const val = event.target.value
      if (this.storageKey) {
        refstorage.set(this.storageKey, val)
      }

      this.value = val

      this.$emit('update:inputValue', val)
    },

    onClose() {
      this.$emit('close')
    },
  },
}
</script>
