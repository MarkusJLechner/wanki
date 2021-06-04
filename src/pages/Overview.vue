<template>
  <TheHeader title="Overview">
    <FlexSpacer />
    <ThemeSwitcher />
    <ButtonOptions />
  </TheHeader>

  <h1>Overview</h1>
</template>

<script>
import TheHeader from '../components/TheHeader.vue'
import FlexSpacer from '../components/FlexSpacer.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import ButtonOptions from '../components/ButtonOptions.vue'

export default {
  components: { ButtonOptions, ThemeSwitcher, FlexSpacer, TheHeader },

  data() {
    return {}
  },
}
</script>
