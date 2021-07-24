<template>
  <div
    v-for="(field, index) in fields"
    :key="index"
    class="text-3xl text-yellow-300"
  >
    <span v-html="field.text" />
    <div v-for="(blob, ii) in field.blobs" :key="ii">
      <audio controls="controls" :src="[blob]" type="audio/mp3" autoplay />
    </div>
  </div>
</template>

<script>
import { getMediaFromNote, replaceMediaFromNote } from '@/plugins/global.js'

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

  data() {
    return {
      fields: [],
    }
  },

  watch: {
    note() {
      this.mountNote()
    },
  },

  methods: {
    async mountNote() {
      if (!this.note) {
        this.fields = []
        return
      }

      const fields = this.note.flds.split('\u001f')

      for (let i = 0; i < fields.length; i++) {
        this.fields[i] = await this.getMedia(fields[i])
      }
    },

    async getMedia(field) {
      const blobs = []
      const promises = []
      const mediaList = getMediaFromNote(field)
      mediaList.forEach((mediaObj) => {
        promises.push(
          wankidb.media.get({ name: mediaObj.media }).then((dbObj) => {
            if (dbObj) {
              blobs.push(
                URL.createObjectURL(
                  new Blob([dbObj.file], { type: 'audio/mp3' }),
                ),
              )
            }
          }),
        )
      })

      await Promise.all(promises)

      return {
        text: replaceMediaFromNote(field),
        blobs,
      }
    },
  },
}
</script>
