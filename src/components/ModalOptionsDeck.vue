<template>
  <BaseModal
    :model-value="!!modelValue"
    :title="modelValue?.text"
    @close="$emit('close')"
  >
    <div v-if="modelValue">
      {{ modelValue.data.col.id }}
      <span class="block" v-html="modelValue.data.col.desc"></span>
    </div>
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
