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
        shadow
        appearance-none
        border
        rounded
        w-full
        py-2
        px-3
        text-gray-700
        leading-tight
        focus:outline-none focus:shadow-outline
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

<script>
import { nanoid } from 'nanoid'

export default {
  name: 'InputTextField',

  props: {
    modelValue: {
      type: [Number, String],
      default: '',
    },

    label: {
      type: String,
      default: '',
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    autofocus: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      default: 'text',
    },

    placeholder: {
      type: String,
      default: '',
    },

    autocomplete: {
      type: String,
      default: 'off',
    },
  },

  emits: ['update:modelValue', 'enter'],

  computed: {
    uid() {
      return nanoid(3)
    },
  },
}
</script>
