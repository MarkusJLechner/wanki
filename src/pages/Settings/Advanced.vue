<template>
  <div>
    <TheHeader title="Advanced" back-button> </TheHeader>

    <List :value="listItems" />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import List from '@/components/List.vue'

interface ListItem {
  text: string
  route: string
}

const listItems: ListItem[] = [
  {
    text: 'FSRS parameters',
    route: '/setting/wanki/fsrs',
  },
]
</script>
