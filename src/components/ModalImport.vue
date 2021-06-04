<template>
  <BaseModal
    :model-value="modelValue"
    title="Import"
    @update:model-value="$emit('update:model-value', $event)"
    @visible="onVisible"
  >
    <span v-if="!isLoaded" @click="onInitImport">
      {{ getStateText }}
    </span>
    <div v-if="error" class="mt-2 text-sm text-red-700 dark:text-red-200">
      ERROR: {{ error }}
    </div>

    <ul v-else>
      <li v-for="(file, index) in files" :key="index">{{ file.filename }}</li>
    </ul>
  </BaseModal>
</template>

<script>
import BaseModal from './BaseModal.vue'
import * as zip from '../plugins/zip/zip.min.js'

export default {
  components: { BaseModal },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      error: null,
      state: {
        init: 'init',
        loading: 'loading',
        loaded: 'loaded',
        imported: 'imported',
        error: 'error',
      },
      currentState: 'loaded',
      files: [],
    }
  },

  computed: {
    isLoaded() {
      return this.currentState === this.state.loaded
    },

    getStateText() {
      switch (this.currentState) {
      case this.state.init:
        return 'Selecting .apkg file...'
      case this.state.loaded:
        return 'Loaded file'
      case this.state.loading:
        return 'Loading file...'
      case this.state.imported:
        return 'Imported'
      case this.state.error:
        return 'Error while reading .apkg file. Click to select another file'
      default:
        return 'Unknown state'
      }
    },
  },

  methods: {
    onVisible(visible) {
      if (!visible) {
        return
      }
      this.onInitImport()
    },

    async onInitImport() {
      this.error = null
      this.files = []
      this.currentState = this.state.init

      try {
        const [fileHandle] = await window.showOpenFilePicker()

        this.currentState = this.state.loading

        const file = await fileHandle.getFile()

        const zip = window.zip
        zip.configure({
          workerScripts: { inflate: ['../plugins/zip/z-worker.js'] },
        })

        const model = (() => {
          return {
            getEntries(file, options) {
              return new zip.ZipReader(new zip.BlobReader(file)).getEntries(
                options,
              )
            },
            async getURL(entry, options) {
              return URL.createObjectURL(
                await entry.getData(new zip.BlobWriter(), options),
              )
            },
          }
        })()

        const entries = await model.getEntries(file)

        this.onFileLoaded(entries)
      } catch (e) {
        this.currentState = this.state.error
        console.error(e)
        this.error = e.message
      }
    },

    onFileLoaded(entries) {
      this.currentState = this.state.loaded

      this.files = entries
        .map((entry, entryIndex) => {
          return {
            entryIndex: entryIndex,
            filename: entry.filename,
            modified: entry.lastModDate.toLocaleString(),
            directory: entry.directory,
            totalBytes: entry.uncompressedSize.toLocaleString(),
            entry: entry,
          }
        })
        .sort((a, b) => {
          if (+b.filename > 0 && +a.filename > 0) {
            return +b.filename - +a.filename
          }
          return (a.filename < b.filename) * 2 - 1
        })
    },
  },
}
</script>

<style scoped></style>
