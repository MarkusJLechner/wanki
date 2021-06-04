<template>
  <div>
    <TheHeader title="Settings" back-button>
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>

    <MainContent>
      <List :value="listItems" />
    </MainContent>
  </div>
</template>

<script>
import TheHeader from 'components/TheHeader.vue'
import FlexSpacer from 'components/FlexSpacer.vue'
import ThemeSwitcher from 'components/ThemeSwitcher.vue'
import List from 'components/List.vue'
import MainContent from 'components/MainContent.vue'

export default {
  components: { MainContent, List, ThemeSwitcher, FlexSpacer, TheHeader },

  data() {
    return {
      listItems: [
        {
          text: 'General settings',
          subtext: 'Various settings',
          route: '/setting/wanki/general',
        },
        {
          text: 'Reviewing',
          subtext: 'Non-deck-specific reviewer settings',
          route: '/setting/wanki/reviewing',
        },
        {
          text: 'Appearance',
          subtext: 'Change themes and default font',
          route: '/setting/wanki/appearance',
        },
        {
          text: 'Gestures',
          subtext: 'Use taps and swipes instead of buttons',
          route: '/setting/wanki/gestures',
        },
        {
          text: 'Advanced',
          subtext: 'Optimization and experimental features',
          route: '/setting/wanki/advanced',
        },
      ],
    }
  },
}
</script>
