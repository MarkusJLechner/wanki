<template>
  <BaseModal
    :model-value="modelValue"
    title="Import"
    :cancel-text="cancelText"
    @update:model-value="$emit('update:model-value', $event)"
    @close="onClose()"
  >
    <span class="block">
      Select an <code>.apkg</code> file. Download
      <a
        class="text-blue-700 dark:text-blue-300"
        target="_blank"
        href="https://ankiweb.net/shared/decks/"
        >shared decks here</a
      >
    </span>

    <div v-if="!progress.total">
      <InputFile :accept="accept" class="my-2" @select="onInitImport" />

      <span class="block text-right text-sm" @click="onInitImport">
        <LoadingIcon v-if="currentState === state.loading" />
        {{ getStateText }}
      </span>
      <div v-if="error" class="mt-2 text-sm text-red-700 dark:text-red-200">
        ERROR: {{ error }}
      </div>

      <ul v-else>
        <li v-for="(file, index) in renderingFiles" :key="index">
          {{ file.text }}
        </li>
      </ul>
    </div>

    <ProgressBar
      v-else
      class="mt-2"
      :label="progress.label"
      :value="progress.value"
      :total="progress.total"
      :tasks="progress.tasks"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import {
  addTask,
  finishTask,
  promiseProgress,
  promptFile,
} from 'plugins/global'
import { decompressFile } from '@/plugins/importer.js'
import InputFile from '@/components/InputFile.vue'
import { importDeck, persist } from '@/plugins/idb.js'
import LoadingIcon from '@/components/LoadingIcon.vue'
import ProgressBar from '@/components/ProgressBar.vue'

interface Progress {
  label: string
  value: number
  total: number
  tasks: string[]
}

interface State {
  init: string
  loading: string
  loaded: string
  imported: string
  notFound: string
  error: string
}

interface Props {
  accept?: string
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: '.apkg',
  modelValue: false,
})

const emit = defineEmits<{
  close: []
  'update:model-value': [value: boolean]
}>()

let decompressedFile: any = null

const progress = ref<Progress>({
  label: 'In Progress',
  value: 0,
  total: 0,
  tasks: [],
})

const error = ref<string | null>(null)
const loadingOnImport = ref(false)
const state: State = {
  init: 'init',
  loading: 'loading',
  loaded: 'loaded',
  imported: 'imported',
  notFound: 'notFound',
  error: 'error',
}
const currentState = ref('init')
const loaded = ref({})
const renderingFiles = ref<Array<any>>([])
const files = ref<Array<any>>([])

const canClose = computed((): boolean => {
  return currentState.value === state.init
})

const cancelText = computed((): string => {
  return canClose.value ? 'Close' : 'Do in Background'
})

const getStateText = computed((): string => {
  switch (currentState.value) {
    case state.init:
      return 'Select .apkg file...'
    case state.loaded:
      return 'Successfully parsed file'
    case state.loading:
      return 'Parsing file...'
    case state.imported:
      return 'Imported'
    case state.notFound:
      return 'Not valid file, missing the anki data'
    case state.error:
      return 'Error while reading .apkg file. Click to select another file'
    default:
      return 'Unknown state'
  }
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      currentState.value = state.init
      error.value = null
      files.value = []
      renderingFiles.value = []
      decompressedFile = null
      progress.value = {
        label: 'In Progress',
        value: 0,
        total: 0,
        tasks: [],
      }
    }
  },
)

function onClose(): void {
  console.log('close')
  emit('close')
}

async function onInitImport(importFiles: any[]): Promise<void> {
  loadingOnImport.value = true
  error.value = null
  files.value = []
  renderingFiles.value = []
  currentState.value = state.init

  try {
    currentState.value = state.loading

    const taskId = addTask({
      id: 'import-progress',
      text: 'Import in progress',
      color: 'yellow',
      loading: true,
    })

    progress.value.label = 'Open file'
    progress.value.tasks = ['Move to memory']
    progress.value.total = 1

    const file = importFiles.length
      ? importFiles[0]
      : await promptFile(props.accept)

    progress.value.label = 'Decompressing'
    const { promise, worker } = decompressFile(file)
    const workListener = (event: MessageEvent) => {
      console.log(event.data[0])
      progress.value.value = 3 - event.data[0].length
      progress.value.total = 3
      progress.value.tasks = event.data[0]
    }
    worker.addEventListener('message', workListener)
    decompressedFile = await promise
    worker.removeEventListener('message', workListener)

    onImport(taskId)
  } catch (e: any) {
    currentState.value = state.error
    console.error(e)
    error.value = e.message
  }
}

async function onImport(taskId: string): Promise<void> {
  if (!decompressedFile) {
    return
  }

  await persist()

  progress.value.label = 'Importing'
  progress.value.tasks = ['Prepare import...']
  const progressObj = await importDeck(decompressedFile)
  await promiseProgress(
    progressObj,
    ({ percent, total, value, payload }: any) => {
      progress.value.value = value
      progress.value.total = total
      if (payload) {
        progress.value.tasks = Object.entries(payload)
          .filter((e) => !e[1])
          .map((e) => e[0])
      }
    },
  ).then(() => {
    console.log('complete')
  })

  finishTask(taskId)

  loadingOnImport.value = false

  decompressedFile = null

  onClose()

  document.dispatchEvent(new Event('page/overview/update'))

  currentState.value = state.init
}
</script>
