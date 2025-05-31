<template>
  <ButtonIcon :icon="icon" @click="switchTheme" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import { refstorage } from '@/store/globalstate'
import { defaultSettings } from 'plugins/defaultSettings.ts'

const icon = ref('')
const iconLight = 'far fa-sun'
const iconDark = 'far fa-moon'

const switchTheme = () => {
  refstorage.toggle('darkTheme')
}

if (refstorage.get('darkTheme', defaultSettings.darkTheme)) {
  icon.value = iconLight
} else {
  icon.value = iconDark
}

watch(refstorage.ref('darkTheme'), (value) => {
  if (value) {
    icon.value = iconLight
  } else {
    icon.value = iconDark
  }
})
</script>

<style scoped></style>
