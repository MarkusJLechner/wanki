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
<script setup>
import { defineProps, reactive } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
defineProps({
  msg: String,
})
const state = reactive({ count: 0 })
const click = () => {
  state.count++
  increment()
}
const increment = () => {
  store.commit('increment')
  console.log(store.state)
}
</script>
<style scoped>
a {
  color: #42b983;
}
</style>
