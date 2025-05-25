<template>
  <div class="mb-4">
    <label
      v-if="!!label"
      class="block text-gray-700 dark:text-gray-300 text-sm mb-2"
      :for="uid"
    >
      {{ label }}
    </label>
    <input
      :id="uid"
      :autofocus="autofocus"
      class="
        shadow-xs
        appearance-none
        border border-gray-200
        rounded-sm
        w-full
        py-2
        px-3
        text-gray-700
        leading-tight
        focus:outline-hidden focus:ring-2 focus:ring-blue-500
      "
      :type="type"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      @keydown.enter="$emit('enter')"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { nanoid } from 'nanoid'

interface Props {
  modelValue?: string | number
  label?: string
  disabled?: boolean
  autofocus?: boolean
  type?: string
  placeholder?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  disabled: false,
  autofocus: false,
  type: 'text',
  placeholder: '',
  autocomplete: 'off'
})

defineEmits<{
  'update:modelValue': [value: string];
  enter: [];
}>()

const uid = computed(() => nanoid(3))
</script>
