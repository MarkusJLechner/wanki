<template>
  <BaseModal
    :model-value="!!modelValue"
    title="Deck options"
    @close="$emit('close')"
  >
    {{ modelValue.text }}
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/BaseModal.vue'
export default {
  components: { BaseModal },

  props: {
    modelValue: {
      type: Object,
      default: null,
    },
  },
}
</script>

<style scoped></style>
