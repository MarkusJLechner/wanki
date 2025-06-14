<template>
  <div ref="container" class="code-editor w-full rounded border"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { basicEditor } from 'prism-code-editor/setups'
import 'prism-code-editor/prism/languages/markup'
import 'prism-code-editor/prism/languages/css'
import { refstorage } from '@/store/globalstate'
import { defaultSettings } from 'plugins/defaultSettings'

interface Props {
  modelValue: string
  language: string
  fontSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 12,
})
const emit = defineEmits(['update:modelValue'])

const container = ref<HTMLElement | null>(null)
let editor: any

watch(
  () => props.fontSize,
  (val) => {
    if (editor && val) editor.setOptions({ fontSize: val })
  },
)

const theme = computed(() =>
  refstorage.get('darkTheme', defaultSettings.darkTheme)
    ? 'github-dark'
    : 'github-light',
)

onMounted(() => {
  if (!container.value) return
  editor = basicEditor(container.value, {
    language: props.language,
    value: props.modelValue,
    theme: theme.value,
    wordWrap: true,
  })
  editor.on('update', (val: string) => emit('update:modelValue', val))
})

watch(
  () => props.modelValue,
  (val) => {
    if (editor && editor.value !== val) {
      editor.setOptions({ value: val })
    }
  },
)

watch(theme, (val) => {
  editor?.setOptions({ theme: val })
})

onBeforeUnmount(() => {
  editor?.remove()
})
</script>

<style scoped>
.code-editor {
  display: grid;
  min-height: 6rem;
  font-size: v-bind(fontSize + 'px');
}
</style>
