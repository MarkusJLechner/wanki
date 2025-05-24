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
      class="h-px opacity-0 overflow-hidden absolute w-px"
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

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  accept?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: ''
})

const emit = defineEmits<{
  (e: 'select', files: File[]): void
}>()

const onHover = ref(false)
const isFocused = ref(false)
const file = ref<HTMLInputElement | null>(null)

const dragover = (event: DragEvent): void => {
  event.preventDefault()
  onHover.value = true
}

const dragleave = (): void => {
  onHover.value = false
}

const drop = (event: DragEvent): void => {
  dragleave()
  event.preventDefault()
  if (event.dataTransfer && file.value) {
    file.value.files = event.dataTransfer.files
    onFilesChange()
  }
}

const onFilesChange = (): void => {
  if (file.value && file.value.files) {
    const files = Array.from(file.value.files)
    emit('select', files)
  }
}
</script>
