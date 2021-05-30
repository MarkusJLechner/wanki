<template>
  <TheHeader title="Help">
    <FlexSpacer />
    <ThemeSwitcher />
  </TheHeader>

  <List :value="listItems" />
</template>

<script>
import TheHeader from '../components/TheHeader.vue'
import FlexSpacer from '../components/FlexSpacer.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import List from '../components/List.vue'

export default {
  components: { List, ThemeSwitcher, FlexSpacer, TheHeader },

  data() {
    return {
      listItems: [
        { icon: 'fas fa-book', text: 'Using Wanki' },
        { icon: 'fas fa-question-circle', text: 'Get help' },
        { icon: 'fas fa-user-friends', text: 'Community' },
      ],
    }
  },
}
</script>
