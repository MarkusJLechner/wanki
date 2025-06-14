<template>
  <div ref="container" class="code-editor w-full rounded border" />
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
let resizeObserver: ResizeObserver | null = null

const theme = computed(() =>
  refstorage.get('darkTheme', defaultSettings.darkTheme)
    ? 'github-dark'
    : 'github-light',
)

const applyAutoGrow = () => {
  if (!container.value) return
  const inner = container.value.querySelector('[contenteditable]')
  if (!inner) return
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(() => {
    if (!container.value || !inner) return
    container.value.style.height = inner.scrollHeight + 'px'
  })
  resizeObserver.observe(inner)
}

onMounted(() => {
  if (!container.value) return
  editor = basicEditor(container.value, {
    language: props.language,
    value: props.modelValue,
    theme: theme.value,
    wordWrap: true,
  })

  editor.on('update', (val: string) => {
    emit('update:modelValue', val)
  })

  setTimeout(applyAutoGrow, 50)
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

watch(
  () => props.fontSize,
  (val) => {
    if (editor && val) {
      editor.setOptions({ fontSize: val })
    }
  },
)

onBeforeUnmount(() => {
  editor?.remove()
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.code-editor {
  display: block;
  max-height: 16rem;
  overflow: hidden;
  transition: height 0.1s ease;
  overflow-y: auto;
  font-size: v-bind(fontSize + 'px');
}
</style>
