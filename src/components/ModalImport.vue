<template>
  <BaseModal
    :model-value="modelValue"
    title="Import"
    confirm="Import"
    :loading="loadingOnImport"
    :disable-confirm="!canImport"
    @update:model-value="$emit('update:model-value', $event)"
    @confirm="onImport"
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

    <input-file :accept="accept" class="my-2" @select="onInitImport" />

    <span class="text-right block text-sm" @click="onInitImport">
      <loading-icon v-if="currentState === state.loading" />
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

    <progress-bar
      v-if="progress.total > 0"
      :value="progress.value"
      :total="progress.total"
      :tasks="progress.tasks"
    />
  </BaseModal>
</template>

<script>
import BaseModal from 'components/BaseModal.vue'
import { promiseProgress, promptFile } from 'plugins/global.js'
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

  emits: ['close'],

  data() {
    return {
      progress: {
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
    canImport() {
      return this.currentState === this.state.loaded
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
        this.progress = {
          value: 0,
          total: 0,
          tasks: [],
        }
      }
    },
  },

  methods: {
    async onInitImport(files) {
      this.loadingOnImport = true
      this.error = null
      this.files = []
      this.renderingFiles = []
      this.currentState = this.state.init

      try {
        this.currentState = this.state.loading

        const file = files.length ? files[0] : await promptFile(this.accept)

        decompressedFile = await decompressFile(file)

        this.currentState = this.state.loaded
      } catch (e) {
        this.currentState = this.state.error
        console.error(e)
        this.error = e.message
      }

      this.loadingOnImport = false
    },

    async onImport() {
      if (!decompressedFile) {
        return
      }

      this.loadingOnImport = true

      await persist()

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

      this.loadingOnImport = false

      decompressedFile = null

      console.log('close')
      this.$emit('close')
    },
  },
}
</script>
