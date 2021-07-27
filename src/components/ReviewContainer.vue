<template>
  <div>
    <div v-html="computedStyle" />
    <span v-if="!showAnswer" class="card" v-html="fieldQuestion" />
    <span v-else class="card" v-html="fieldAnswer" />
  </div>

  <div
    v-for="(field, index) in fields"
    :key="index"
    class="text-3xl text-yellow-300"
  >
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

    showAnswer: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      fields: [],
      fieldQuestion: '',
      fieldAnswer: '',
      cardStyle: '',
    }
  },

  computed: {
    computedStyle() {
      return `<style>${this.cardStyle}</style>`
    },
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

      const fieldValues = this.note.flds.split('\u001f')

      const template = await this.card.template
      const model = await this.card.model
      let fields = await this.card.fields
      fields = fields.map((f, i) => {
        return {
          ...f,
          fieldValue: fieldValues[i],
        }
      })

      this.fieldQuestion = this.parseTemplate(template.qfmt, fields)
      this.fieldAnswer = this.parseTemplate(template.afmt, [
        { name: 'FrontSide', fieldValue: this.fieldQuestion },
        ...fields,
      ])

      this.fieldQuestion = await this.replaceImages(this.fieldQuestion)
      this.fieldAnswer = await this.replaceImages(this.fieldAnswer)

      this.cardStyle = model.css

      console.log({ template, fields, fieldValues })

      for (let i = 0; i < fieldValues.length; i++) {
        this.fields[i] = await this.getMedia(fieldValues[i])
      }
    },

    parseTemplate(templateString, fields) {
      console.log('parse', { templateString, fields })
      const regex = /{{(?<field>.*?)}}/gm
      let m
      let matches = []
      while ((m = regex.exec(templateString)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++
        }
        matches.push(m)
      }

      matches.forEach((match) => {
        const templateField = match.groups.field
        const field = fields.find((f) => f.name === templateField)
        if (field) {
          templateString = templateString.replaceAll(
            `{{${templateField}}}`,
            field.fieldValue,
          )
        }
      })

      console.log({ matches, templateString })

      return templateString
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
