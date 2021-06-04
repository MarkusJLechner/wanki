<template>
  <div>
    <TheHeader title="Statistics">
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>
    <h1>Statistics</h1>
  </div>
</template>

<script>
import TheHeader from 'components/TheHeader.vue'
import FlexSpacer from 'components/FlexSpacer.vue'
import ThemeSwitcher from 'components/ThemeSwitcher.vue'

export default {
  components: { ThemeSwitcher, FlexSpacer, TheHeader },
}
</script>
