<template>
  <div
    class="flex items-center justify-between"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div
      class="flex h-6 w-12 items-center rounded-full bg-gray-300 duration-300 ease-in-out"
      :class="{ 'bg-green-400': modelValue }"
    >
      <div
        class="h-6 w-6 rounded-full bg-white shadow-md duration-200 ease-in-out"
        :class="{ 'translate-x-6': modelValue }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
