<template>
  <div>
    <TheHeader title="Appearance" back-button>
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>

    <List :value="listItems" />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import List from '@/components/List.vue'

const listItems: any[] = []
</script>
