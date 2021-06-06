<template>
  <BaseModal
    :model-value="modelValue"
    title="Import"
    confirm="Import"
    :disable-confirm="!canImport"
    @update:model-value="$emit('update:model-value', $event)"
    @visible="onVisible"
    @confirm="onImport"
  >
    <span v-if="!isLoaded" @click="onInitImport">
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
  </BaseModal>
</template>

<script>
import BaseModal from 'components/BaseModal.vue'
import { promptFile } from 'plugins/global.js'
import { parseFile } from '@/plugins/importer.js'

let files = []

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
        notFound: 'notFound',
        error: 'error',
      },
      currentState: 'loaded',
      files: [],
      renderingFiles: [],
    }
  },

  computed: {
    canImport() {
      return this.currentState === this.state.loaded
    },

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
      case this.state.notFound:
        return 'Not valid file, missing the anki data'
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

    zipGetEntries(file, options) {
      return new this.zip.ZipReader(new this.zip.BlobReader(file)).getEntries(
        options,
      )
    },

    async onInitImport() {
      this.error = null
      files = []
      this.files = []
      this.renderingFiles = []
      this.currentState = this.state.init

      try {
        this.currentState = this.state.loading

        const file = await promptFile('*.apkg')

        const parsed = await parseFile(file)
        console.log(parsed)

        const res = parsed.db.exec('SELECT * FROM notes')

        parsed.fun({
          start: Math.floor(Math.random() * parsed.media.length) - 10,
          max: 10,
          time: 700,
        })

        console.log(res)

        this.currentState = this.state.imported
      } catch (e) {
        this.currentState = this.state.error
        console.error(e)
        this.error = e.message
      }
    },

    async onImport() {
      console.log('do import')

      if (this.files.length > 0) {
        await this.download(files[0])
        console.log(files[0])
      } else {
        console.log('wtf')
      }
    },
  },
}
</script>
