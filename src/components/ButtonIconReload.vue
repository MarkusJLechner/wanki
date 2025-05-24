<template>
  <ButtonIcon icon="fas fa-redo-alt" @click="reload" />
</template>

<script setup lang="ts">
import ButtonIcon from '@/components/ButtonIcon.vue'

const reload = (): void => {
  location.reload()
}
</script>
