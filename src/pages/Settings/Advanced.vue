<template>
  <div>
    <TheHeader title="Advanced" back-button> </TheHeader>

    <List :value="listItems" />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import List from '@/components/List.vue'

const listItems: any[] = []
</script>
