<template>
  <div>
    <TheHeader title="Gestures" back-button> </TheHeader>

    <List :value="listItems" />
  </div>
</template>

<script>
import TheHeader from '@/components/TheHeader.vue'
import List from 'components/List.vue'

export default {
  components: { List, TheHeader },

  data() {
    return {
      listItems: [],
    }
  },
}
</script>
