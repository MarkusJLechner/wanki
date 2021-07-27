<template>
  <div
    v-for="(field, index) in fields"
    :key="index"
    class="text-3xl text-yellow-300"
  >
    <span v-html="field.text" />
    <div v-for="(file, ii) in field.files" :key="ii">
      <ReviewAudio :db-media-string="file" />
    </div>
  </div>
</template>

<script>
import {
  getMediaFromNote,
  replaceMediaFromNote,
  replaceAsync,
} from '@/plugins/global.js'
import ReviewAudio from '@/components/ReviewAudio.vue'

export default {
  name: 'ReviewContainer',
  components: { ReviewAudio },
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
      const files = []
      const promises = []
      const mediaList = getMediaFromNote(field)
      mediaList.forEach((mediaObj) => {
        files.push(mediaObj.media)

        promises.push(
          wankidb.media.get({ name: mediaObj.media }).then((dbObj) => {
            if (dbObj) {
              blobs.push(URL.createObjectURL(new Blob([dbObj.file])))
            }
          }),
        )
      })

      await Promise.all(promises)

      const cleanedField = replaceMediaFromNote(field)

      return {
        text: await this.replaceImages(cleanedField),
        blobs,
        files,
      }
    },

    async replaceImages(field) {
      field = await replaceAsync(
        field,
        /src\s*=\s*"(?<src>.+?)"/gm,
        async (src) => {
          src = src.slice(5, -1)
          const media = await wankidb.media.get({ name: src })
          const url = media ? URL.createObjectURL(new Blob([media.file])) : ''
          return `src="${url}"`
        },
      )

      return field
    },
  },
}
</script>
