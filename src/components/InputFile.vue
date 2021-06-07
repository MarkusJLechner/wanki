<template>
  <div
    :class="{ 'border-blue-500': onHover, 'border-blue-500': isFocused }"
    class="
      dragover
      relative
      bg-gray-600
      border-dashed border-2
      min-h-[120px]
      flex
      font-medium
      text-center
      w-full
      focus:border-blue-200
      active:border-blue-200
      hover:border-blue-200
      cursor-pointer
    "
    @click="$refs.file.click()"
    @dragleave="dragleave"
    @dragover="dragover"
    @drop="drop"
  >
    <input
      id="assetsFieldHandle"
      ref="file"
      :accept="accept"
      :multiple="false"
      class="h-[1px] opacity-0 overflow-hidden absolute w-[1px]"
      name="fields[assetsFieldHandle][]"
      type="file"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @input="onFilesChange"
    />
    <label
      class="place-self-center pointer-events-none w-full"
      for="assetsFieldHandle"
    >
      <span class="text-blue-200 text-sm font-bold mr-1">
        <i class="fas fa-cloud mr-1" />
        Choose file
      </span>
      <span class="text-caption"> or place here </span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    accept: {
      type: String,
      default: '',
    },
  },
  emits: ['select'],

  data() {
    return {
      onHover: false,
      isFocused: false,
    }
  },

  methods: {
    dragover(event) {
      event.preventDefault()
      this.onHover = true
    },

    dragleave() {
      this.onHover = false
    },

    drop(event) {
      this.dragleave()
      event.preventDefault()
      this.$refs.file.files = event.dataTransfer.files
      this.onFilesChange()
    },

    onFilesChange() {
      const files = [...this.$refs.file.files]
      this.$emit('select', files)
    },
  },
}
</script>
