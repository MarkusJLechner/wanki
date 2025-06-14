<template>
  <ButtonIcon icon="fas fa-language" @click="cycleLanguage" />
</template>

<script setup lang="ts">
import ButtonIcon from '@/components/ButtonIcon.vue'
import { refstorage } from '@/store/globalstate'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = ['en', 'de', 'ja']

const cycleLanguage = () => {
  const current =
    (refstorage.get('setting.general.language', 'en') as string) || 'en'
  const idx = languages.indexOf(current)
  const next = languages[(idx + 1) % languages.length]
  refstorage.set('setting.general.language', next)
  locale.value = next
}
</script>

<style scoped></style>
