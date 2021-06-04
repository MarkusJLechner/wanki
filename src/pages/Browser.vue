<template>
  <div>
    <TheHeader title="Browser">
      <FlexSpacer />
      <ThemeSwitcher />
      <ThemeSwitcher />
      <ThemeSwitcher />
    </TheHeader>
    <h1>Browser</h1>
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
