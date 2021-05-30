<template>
  <div
    class="flex justify-between items-center"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div
      class="
        w-12
        h-6
        flex
        items-center
        bg-gray-300
        rounded-full
        duration-300
        ease-in-out
      "
      :class="{ 'bg-green-400': modelValue }"
    >
      <div
        class="
          bg-white
          w-6
          h-6
          rounded-full
          shadow-md
          transform
          duration-200
          ease-in-out
        "
        :class="{ 'translate-x-6': modelValue }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
