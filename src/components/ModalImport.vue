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

      <span class="text-right block text-sm" @click="onInitImport">
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

<script>
import BaseModal from 'components/BaseModal.vue'
import {
  addTask,
  finishTask,
  promiseProgress,
  promptFile,
} from 'plugins/global.js'
import { decompressFile } from '@/plugins/importer.js'
import InputFile from '@/components/InputFile.vue'
import { importDeck, persist } from '@/plugins/idb.js'
import LoadingIcon from '@/components/LoadingIcon.vue'
import ProgressBar from '@/components/ProgressBar.vue'

let decompressedFile = null

export default {
  components: { ProgressBar, LoadingIcon, InputFile, BaseModal },

  props: {
    accept: {
      type: String,
      default: '.apkg',
    },

    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['close', 'update:model-value'],

  data() {
    return {
      progress: {
        label: 'In Progress',
        value: 0,
        total: 0,
        tasks: [],
      },
      error: null,
      loadingOnImport: false,
      state: {
        init: 'init',
        loading: 'loading',
        loaded: 'loaded',
        imported: 'imported',
        notFound: 'notFound',
        error: 'error',
      },
      currentState: 'init',
      loaded: {},
      renderingFiles: [],
    }
  },

  computed: {
    cancelText() {
      return this.canClose ? 'Close' : 'Do in Background'
    },

    canClose() {
      return this.currentState === this.state.init
    },

    getStateText() {
      switch (this.currentState) {
        case this.state.init:
          return 'Select .apkg file...'
        case this.state.loaded:
          return 'Successfully parsed file'
        case this.state.loading:
          return 'Parsing file...'
        case this.state.imported:
          return 'Imported'
        case this.state.notFound:
          return 'Not valid file, missing the anki data'
        case this.state.error:
          return 'Error while reading .apkg file. Click to select another file'
        default:
          return 'Unknown state'
      }
    },
  },

  watch: {
    modelValue(newValue) {
      if (newValue) {
        this.currentState = this.state.init
        this.error = null
        this.files = []
        this.renderingFiles = []
        decompressedFile = null
        this.progress = {
          value: 0,
          total: 0,
          tasks: [],
        }
      }
    },
  },

  methods: {
    onClose() {
      console.log('close')
      this.$emit('close')
    },

    async onInitImport(files) {
      this.loadingOnImport = true
      this.error = null
      this.files = []
      this.renderingFiles = []
      this.currentState = this.state.init

      try {
        this.currentState = this.state.loading

        const taskId = addTask({
          id: 'import-progress',
          text: 'Import in progress',
          color: 'yellow',
          loading: true,
        })

        this.progress.label = 'Open file'
        this.progress.tasks = ['Move to memory']
        this.progress.total = 1

        const file = files.length ? files[0] : await promptFile(this.accept)

        this.progress.label = 'Decompressing'
        const { promise, worker } = decompressFile(file)
        const workListener = (event) => {
          console.log(event.data[0])
          this.progress.value = 3 - event.data[0].length
          this.progress.total = 3
          this.progress.tasks = event.data[0]
        }
        worker.addEventListener('message', workListener)
        decompressedFile = await promise
        worker.removeEventListener('message', workListener)

        this.onImport(taskId)
      } catch (e) {
        this.currentState = this.state.error
        console.error(e)
        this.error = e.message
      }
    },

    async onImport(taskId) {
      if (!decompressedFile) {
        return
      }

      await persist()

      this.progress.label = 'Importing'
      this.progress.tasks = ['Prepare import...']
      const progress = await importDeck(decompressedFile)
      await promiseProgress(progress, ({ percent, total, value, payload }) => {
        this.progress.value = value
        this.progress.total = total
        if (payload) {
          this.progress.tasks = Object.entries(payload)
            .filter((e) => !e[1])
            .map((e) => e[0])
        }
      }).then(() => {
        console.log('complete')
      })

      finishTask(taskId)

      this.loadingOnImport = false

      decompressedFile = null

      this.onClose()

      document.dispatchEvent(new Event('page/overview/update'))

      this.currentState = this.state.init
    },
  },
}
</script>
