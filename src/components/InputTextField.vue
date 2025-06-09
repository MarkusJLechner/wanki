<template>
  <div class="mb-4">
    <label
      v-if="!!label"
      class="mb-2 block text-sm text-gray-700 dark:text-gray-300"
      :for="uid"
    >
      {{ label }}
    </label>
    <input
      :id="uid"
      :autofocus="autofocus"
      class="w-full appearance-none rounded-sm border border-gray-200 px-3 py-2 leading-tight text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:text-gray-100"
      :type="type"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      @keydown.enter="$emit('enter')"
      @input="
        emit(
          'update:modelValue',
          ($event.target as HTMLInputElement)?.value || '',
        )
      "
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { nanoid } from 'nanoid'
import type { InputTextFieldProps } from './InputTextField.ts'

withDefaults(defineProps<InputTextFieldProps>(), {
  modelValue: '',
  label: '',
  disabled: false,
  autofocus: false,
  type: 'text',
  placeholder: '',
  autocomplete: 'off',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  enter: []
}>()

const uid = computed(() => nanoid(3))
</script>
