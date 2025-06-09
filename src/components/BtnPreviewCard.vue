<template>
  <ButtonIcon icon="far fa-eye" @click="onPreviewCard" />

  <CardPreviewModal v-model="showPreview" :card="card" />
</template>

<script setup lang="ts">
import ButtonIcon from 'components/ButtonIcon.vue'
import CardPreviewModal from 'components/CardPreviewModal.vue'
import type { Card } from 'plugins/wankidb/Card.ts'
import { watch } from 'vue'

defineProps<{ card: Card | null }>()
const emit = defineEmits<{
  preview: []
}>()
const showPreview = defineModel({ default: false })

watch(
  () => showPreview.value,
  () => {
    emit('preview')
  },
)

function onPreviewCard() {
  showPreview.value = true
}
</script>

<style scoped></style>
