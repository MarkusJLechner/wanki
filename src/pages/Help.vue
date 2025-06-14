<template>
  <div>
    <TheHeader title="Help">
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>

    <List :value="listItems" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import List from '@/components/List.vue'

interface ListItem {
  icon: string
  text: string
  route?: string
}

const listItems = ref<ListItem[]>([
  { icon: 'fas fa-book', text: 'Using Wanki' },
  { icon: 'fas fa-question-circle', text: 'Get help' },
  { icon: 'fas fa-user-friends', text: 'Community' },
  { icon: 'fas fa-info-circle', text: 'Wiki', route: '/wiki' },
])
</script>
