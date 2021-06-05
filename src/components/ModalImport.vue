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
import * as zip from 'plugins/zip/zip.min.js'
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
    zip() {
      return window.zip
    },

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

        return

        this.zip.configure({
          workerScripts: { inflate: ['/z-worker.js'] },
        })

        const entries = await this.zipGetEntries(file, {
          filenameEncoding: 'cp437',
        })

        this.onFileLoaded(entries)
      } catch (e) {
        this.currentState = this.state.error
        console.error(e)
        this.error = e.message
      }
    },

    isValid(entries) {
      return entries.some(
        (entry) => entry.filename.split('.').pop() === 'anki2',
      )
    },

    onFileLoaded(entries) {
      this.currentState = this.state.loaded

      if (!this.isValid(entries)) {
        this.onFinishInValid()
        return
      }

      entries = entries.sort((a, b) => {
        if (+b.filename >= 0 && +a.filename >= 0) {
          return +b.filename - +a.filename
        }
        return (a.filename < b.filename) * 2 - 1
      })

      let mediaCount = 0
      this.renderingFiles = entries
        .map((file) => {
          if (+file.filename >= 0) {
            mediaCount++
            return null
          }

          return {
            text: file.filename,
          }
        })
        .filter((file) => file !== null)

      this.renderingFiles.push({ text: `Found ${mediaCount} media files` })

      this.onFinishValidate(entries)
    },

    saveFile(filename, blob) {
      const a = document.createElement('a')
      document.body.appendChild(a)
      const url = window.URL.createObjectURL(blob)
      a.href = url
      a.download = filename
      const clickEvent = new MouseEvent('click')
      a.dispatchEvent(clickEvent)
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 0)
    },

    async download(entry) {
      // const unzipProgress = document.createElement('progress')
      // li.appendChild(unzipProgress)
      const controller = new AbortController()
      const signal = controller.signal
      // const abortButton = document.createElement('button')
      // abortButton.onclick = () => controller.abort()
      // abortButton.textContent = '✖'
      // abortButton.title = 'Abort'
      // li.querySelector('.filename-container').appendChild(abortButton)
      // li.classList.add('busy')

      const progress = {
        value: 0,
        max: 0,
      }

      console.log('hheee', entry)

      const blob = await entry.getData(new this.zip.BlobWriter(), {
        password: '',
        onprogress: (index, max) => {},
        signal,
      })
      console.log('save me', blob)

      debugger

      // this.saveFile(entry.filename, blob)
    },

    onFinishValidate(entries) {
      this.files = entries
      files = entries
    },

    onFinishInValid() {
      this.currentState = this.state.notFound
      console.log('vonFinishInValidalid')
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
