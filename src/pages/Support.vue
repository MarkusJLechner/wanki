<template>
  <TheHeader title="Support Wanki">
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
        { icon: 'fas fa-dollar-sign', text: 'Donate' },
        { icon: 'fas fa-language', text: 'Translate' },
        { icon: 'fas fa-code', text: 'Develop' },
        { icon: 'fas fa-star', text: 'Rate' },
        { icon: 'fas fa-question-circle', text: 'Other' },
        { icon: 'fas fa-envelope', text: 'Send feedback' },
      ],
    }
  },
}
</script>
