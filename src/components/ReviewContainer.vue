<template>
  <div
    v-for="(field, index) in getFields()"
    :key="index"
    class="text-5xl text-yellow-300"
  >
    <span v-html="field" />
  </div>
</template>

<script>
import {
  getMediaFromNote,
  playAudio,
  replaceMediaFromNote,
} from '@/plugins/global.js'

export default {
  name: 'ReviewContainer',

  props: {
    card: {
      type: Object,
      default: () => {},
    },
    note: {
      type: Object,
      default: () => {},
    },
    deck: {
      type: Object,
      default: () => {},
    },
  },

  watch: {
    note() {
      this.mountNote()
    },
  },

  methods: {
    getFields() {
      if (!this.note) {
        return []
      }

      return replaceMediaFromNote(this.note.flds)
        .split('\u001fa')
        .filter(Boolean)
    },

    mountNote() {
      console.log(this.note)

      const mediaList = getMediaFromNote(this.getFields())
      mediaList.forEach((mediaObj) => {
        wankidb.media.get({ name: mediaObj.media }).then((dbObj) => {
          console.log(dbObj)
          playAudio(dbObj.file)
        })
      })
    },
  },
}
</script>

<style scoped></style>
