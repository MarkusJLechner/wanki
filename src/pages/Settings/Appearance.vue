<template>
  <div>
    <TheHeader :title="t('Appearance')" back-button>
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>

    <List :value="listItems" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import List from '@/components/List.vue'

const { t } = useI18n()

const listItems: any[] = []
</script>
