<template>
  <div>
    <TheHeader title="Gestures" back-button> </TheHeader>

    <List :value="listItems" />
  </div>
</template>

<script>
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from 'components/FlexSpacer.vue'
import ThemeSwitcher from 'components/ThemeSwitcher.vue'
import List from 'components/List.vue'

export default {
  components: { List, ThemeSwitcher, FlexSpacer, TheHeader },

  data() {
    return {
      listItems: [],
    }
  },
}
</script>
