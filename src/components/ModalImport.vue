<template>
  <BaseModal
    :model-value="modelValue"
    title="Import"
    confirm="Import"
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
  </BaseModal>
</template>

<script>
import BaseModal from 'components/BaseModal.vue'
import { promptFile } from 'plugins/global.js'
import { importParsedObject, parseFile } from '@/plugins/importer.js'
import InputFile from '@/components/InputFile.vue'
import { persist } from '@/plugins/storage.js'
import LoadingIcon from '@/components/LoadingIcon.vue'

let parsed = null

export default {
  components: { LoadingIcon, InputFile, BaseModal },

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

  methods: {
    async onInitImport(files) {
      this.error = null
      this.files = []
      this.renderingFiles = []
      this.currentState = this.state.init

      try {
        this.currentState = this.state.loading

        const file = files.length ? files[0] : await promptFile(this.accept)

        parsed = await parseFile(file)

        console.log(parsed)

        const res = parsed.db.exec('SELECT * FROM notes')

        // parsed.fun({
        //   start: Math.floor(Math.random() * parsed.media.length),
        //   max: 10,
        //   time: 700,
        // })

        console.log(res)

        this.currentState = this.state.loaded
      } catch (e) {
        this.currentState = this.state.error
        console.error(e)
        this.error = e.message
      }
    },

    async onImport() {
      if (!parsed) {
        return
      }

      console.log(parsed)

      await persist()
      const deck = await importParsedObject(parsed)
      console.log(deck)
    },
  },
}
</script>
