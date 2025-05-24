<template>
  <h1>{{ msg }}</h1>
  <p>
    <a href="https://vitejs.dev/guide/features.html" target="_blank"
      >Vite Documentation</a
    >
    |
    <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Documentation</a>
  </p>
  <button @click="click()">count is: {{ state.count }}</button>
  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useStore } from 'vuex'

interface Props {
  msg?: string
}

defineProps<Props>()

const store = useStore()
const state = reactive({ count: 0 })

const click = (): void => {
  state.count++
  increment()
}

const increment = (): void => {
  store.commit('increment')
  console.log(store.state)
}
</script>
<style scoped>
a {
  color: #42b983;
}
</style>
