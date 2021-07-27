<template>
  <div>
    <TheHeader title="Reviewing" back-button> </TheHeader>

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
      listItems: [
        {
          text: 'Show native Audio-Controls',
          subtext: 'Native controls have more functionality',
          toggle: 'setting/reviewing/audioControls',
        },
      ],
    }
  },
}
</script>
