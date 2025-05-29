<template>
  <div
    :class="{ 'border-blue-500': onHover || isFocused }"
    class="dragover relative flex min-h-[120px] w-full cursor-pointer border-2 border-dashed bg-gray-600 text-center font-medium hover:border-blue-200 focus:border-blue-200 active:border-blue-200"
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
      class="absolute h-px w-px overflow-hidden opacity-0"
      name="fields[assetsFieldHandle][]"
      type="file"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @input="onFilesChange"
    />
    <label
      class="pointer-events-none w-full place-self-center"
      for="assetsFieldHandle"
    >
      <span class="mr-1 text-sm font-bold text-blue-200">
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
  accept: '',
})

const emit = defineEmits<{
  select: [files: File[]]
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
