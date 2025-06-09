<template>
  <button
    v-ripple
    type="button"
    class="m-1 mt-3 inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:bg-gray-700 dark:text-white"
    style="min-height: 40px"
  >
    <slot>
      <i v-if="loading" class="fas fa-spinner fa-spin" @click.prevent.stop />
      <span v-else>{{ text }}</span>
    </slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  text: '',
  loading: false,
})
</script>
