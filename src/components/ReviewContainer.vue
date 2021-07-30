<template>
  <div class="h-full w-full left-0 top-0 absolute z-10">
    <div class="fixed bottom-28 right-4 w-full">
      <ReviewMedia :media-list="computedSoundList" />
    </div>
  </div>
  <div class="relative w-full h-full">
    <IFrameContainer
      :body-class="computedDarkTheme"
      class="w-full"
      :css="computedStyle"
    >
      <span v-if="!showAnswer" class="card question" v-html="fieldQuestion" />
      <span v-else class="card answer" v-html="fieldAnswer" />
    </IFrameContainer>
  </div>
</template>

<script>
import {
  getMediaFromNote,
  replaceAsync,
  replaceMediaFromNote,
} from '@/plugins/global.js'
import IFrameContainer from '@/components/IFrameContainer.js'
import { refstorage } from '@/store/globalstate.js'
import ReviewMedia from '@/components/ReviewMedia.vue'

export default {
  name: 'ReviewContainer',

  components: { ReviewMedia, IFrameContainer },

  props: {
    card: {
      type: Object,
      default: null,
    },

    showAnswer: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      fieldQuestion: '',
      fieldAnswer: '',
      cardStyle: '',
      soundListQuestion: [],
      soundListAnswer: [],
    }
  },

  computed: {
    computedSoundList() {
      return this.showAnswer ? this.soundListAnswer : this.soundListQuestion
    },

    computedDarkTheme() {
      return refstorage.get('darkTheme', true) ? 'dark' : ''
    },

    computedStyle() {
      return `<style>
        html, body { width: 100%; height: 100%; margin: 0; padding: 0;  }
        body img { max-width: 100%; }
        .card { background-color: inherit !important; }
        .dark .card { color: white; }
        ${this.cardStyle}
      </style>`
    },
  },

  watch: {
    card() {
      this.mountNote()
    },

    showAnswer() {
      this.setIFrameHeight(true)
    },
  },

  methods: {
    setIFrameHeight(reset = false) {
      if (reset) {
        this.setIframeHeight(0)
      }
      this.$nextTick(() => {
        this.setIframeHeight()
      })

      setInterval(() => {
        this.setIframeHeight()
      }, 200)
    },

    setIframeHeight(height) {
      const iframe = document.querySelector('iframe')
      iframe.height = '' + (height ?? this.getIframeHeight())
    },

    getIframeHeight() {
      return document.querySelector('iframe').contentWindow.document.body
        .scrollHeight
    },

    async mountNote() {
      const template = await this.card.template
      const model = await this.card.model
      const fields = await this.card.fields

      window.card = await this.card
      window.note = await this.card.note
      window.model = await this.card.model

      this.fieldQuestion = this.parseTemplate(template.qfmt, fields)
      this.fieldAnswer = this.parseTemplate(template.afmt, [
        { name: 'FrontSide', fieldValue: this.fieldQuestion },
        ...fields,
      ])

      this.soundListQuestion = this.getMediaList(this.fieldQuestion)
      this.soundListAnswer = this.getMediaList(this.fieldAnswer)

      this.fieldQuestion = await this.replaceImages(this.fieldQuestion)
      this.fieldQuestion = replaceMediaFromNote(this.fieldQuestion)
      this.fieldAnswer = await this.replaceImages(this.fieldAnswer)
      this.fieldAnswer = replaceMediaFromNote(this.fieldAnswer)

      this.cardStyle = model.css

      this.setIFrameHeight()
    },

    parseTemplate(templateString, fields) {
      // remove type: tags
      templateString = templateString.replaceAll(/({{type:[^}]+}})/gm, '')
      // remove all special tags, like furigana: kanji: etc
      templateString = templateString.replaceAll(/{{[^:}]+:([^}]+}})/gm, '{{$1')
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

      return templateString
    },

    getMediaList(field) {
      return getMediaFromNote(field)
    },

    preloadImage(url) {
      const img = new Image()
      img.src = url
      img.onerror = function () {
        return false
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
          this.preloadImage(url)
          return `src="${url}" onerror="this.src = '';this.onerror='';" `
        },
      )

      return field
    },
  },
}
</script>
