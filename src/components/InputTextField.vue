<template>
  <div class="mb-4">
    <label
      v-if="!!label"
      class="block text-gray-700 dark:text-gray-300 text-sm mb-2"
      for="username"
    >
      {{ label }}
    </label>
    <input
      id="username"
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
        focus:outline-none
        focus:shadow-outline
      "
      type="text"
      :autocomplete="autocomplete"
      placeholder="Username"
      :value="modelValue"
      :disabled="disabled"
      @keydown.enter="$emit('enter')"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script>
export default {
  name: 'InputTextField',

  props: {
    modelValue: {
      type: String,
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

    autocomplete: {
      type: String,
      default: 'off',
    },
  },

  emits: ['update:modelValue', 'enter'],
}
</script>
