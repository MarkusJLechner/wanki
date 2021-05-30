<template>
  <div class="flex flex-col">
    <h1 class="text-blue-700 font-bold dark:text-blue-300 px-4 pt-2 -mb-2">
      {{ value }}
    </h1>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },
}
</script>
