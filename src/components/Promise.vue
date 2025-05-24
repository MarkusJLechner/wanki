<template>
  <slot :result="result" :catch="error" :loading="loading" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  promise?: Promise<any> | null;
}

const props = withDefaults(defineProps<Props>(), {
  promise: null
})

const result = ref<any>(null)
const error = ref<any>(null)
const loading = ref(false)

watch(() => props.promise, (newValue) => {
  if (newValue) {
    loading.value = true
    newValue
      .then((res) => (result.value = res))
      .catch((err) => (error.value = err))
      .finally(() => (loading.value = false))
  } else {
    result.value = null
    error.value = null
    loading.value = false
  }
}, { immediate: true })
</script>
