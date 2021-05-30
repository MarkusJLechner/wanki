<template>
  <TheHeader title="Review">
    <FlexSpacer />
    <ThemeSwitcher />
  </TheHeader>
  <h1>Review</h1>
</template>

<script>
import TheHeader from '../components/TheHeader.vue'
import FlexSpacer from '../components/FlexSpacer.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

export default {
  components: { ThemeSwitcher, FlexSpacer, TheHeader },
}
</script>
