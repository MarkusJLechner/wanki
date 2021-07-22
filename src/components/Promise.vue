<template>
  <slot :result="result" :catch="error" :loading="loading" />
</template>

<script>
export default {
  name: 'Promise',

  props: {
    promise: {
      type: Promise,
      default: null,
    },
  },

  data() {
    return {
      result: null,
      error: null,
      loading: false,
    }
  },

  watch: {
    promise: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.loading = true
          newValue
            .then((result) => (this.result = result))
            .catch((error) => (this.error = error))
            .finally(() => (this.loading = false))
        } else {
          this.result = null
          this.error = null
          this.loading = false
        }
      },
    },
  },
}
</script>
