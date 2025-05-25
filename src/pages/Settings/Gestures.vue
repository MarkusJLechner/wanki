<template>
  <div>
    <TheHeader title="Gestures" back-button> </TheHeader>

    <List :value="listItems" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import List from '@/components/List.vue'

interface ListItem {
  // Define the structure of your list items here
  [key: string]: any
}

const listItems = ref<ListItem[]>([])
</script>
