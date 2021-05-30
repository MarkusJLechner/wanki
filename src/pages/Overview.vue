<template>
  <TheHeader title="Overview">
    <FlexSpacer />
    <ThemeSwitcher />
  </TheHeader>

  <h1>Overview</h1>
</template>

<script>
import TheHeader from '../components/TheHeader.vue'
import FlexSpacer from '../components/FlexSpacer.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

export default {
  components: { ThemeSwitcher, FlexSpacer, TheHeader },

  data() {
    return {}
  },
}
</script>
