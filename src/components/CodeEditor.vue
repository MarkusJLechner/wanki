<template>
  <div>
    <div ref="container" class="code-editor w-full rounded border" />
    <div class="text-right" v-if="props.language === 'html'">
      <button
        class="w-full cursor-pointer rounded-b bg-gray-700 py-1 text-sm"
        @click="formatCode"
      >
        Format
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { basicEditor } from 'prism-code-editor/setups'
import 'prism-code-editor/prism/languages/markup'
import 'prism-code-editor/prism/languages/css'
import prettier from 'prettier/standalone'
import parserHtml from 'prettier/plugins/html'
import { refstorage } from '@/store/globalstate'
import { defaultSettings } from 'plugins/defaultSettings'
import ButtonIcon from 'components/ButtonIcon.vue'

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

const formatCode = async () => {
  if (!editor) return
  try {
    const value = editor.value.trim().replaceAll('</br>', '<br />')
    const formatted = await prettier.format(value, {
      parser: 'html',
      plugins: [parserHtml],
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'none',
      htmlWhitespaceSensitivity: 'css',
    })
    editor.setOptions({ value: formatted })
    emit('update:modelValue', formatted)
    setTimeout(applyAutoGrow, 50)
  } catch (e) {
    console.error('Format error', e)
  }
}

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
