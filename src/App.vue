<template>
  <main
    class="
      dark:text-white
      h-screen
      flex flex-col
      text-lg
      dark:bg-gray-600
      bg-gray-200
    "
  >
    <router-view />
  </main>
</template>

<script>
import { watch } from 'vue'
import { refstorage } from './store/globalstate'

export default {
  mounted() {
    refstorage.get('darkTheme', true)

    let htmlClasses = document.querySelector('html').classList
    watch(refstorage.ref('darkTheme'), (value) => {
      if (value) {
        htmlClasses.add('dark')
      } else {
        htmlClasses.remove('dark')
      }
    })

    if (refstorage.get('darkTheme', true)) {
      document.querySelector('html').classList.add('dark')
    } else {
      document.querySelector('html').classList.remove('dark')
    }
  },
}
</script>

<style scoped>
html,
body {
  width: 100%;
  height: 100%;
}
</style>
