<template>
  <div class="h-full w-full left-0 top-0 absolute z-10">
    <div class="fixed bottom-28 px-4 w-full">
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
} from '@/plugins/global'
import IFrameContainer from '@/components/IFrameContainer.js'
import { refstorage } from '@/store/globalstate'
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
      return /* language=css */ `
        html, body {
          width: 100%;
          margin: 0;
          padding: 0;
        }
        body {
          padding-bottom: 100px;
        }
        body img {
          max-width: 100%;
          width: 100%;
          max-height: 370px;
          object-fit: contain;
        }
        hr {
          border-width: 2px;
          border-style: solid;
          border-radius: 6px;
          border-color: #20202052;
        }
        hr .dark {
          border-width: 2px;
          border-style: solid;
          border-radius: 6px;
          border-color: #ffffff52;
        }
        .card { background-color: inherit !important; }
        .dark .card { color: white; }
        ${this.cardStyle}
      `
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

      setTimeout(() => {
        this.setIframeHeight()
      }, 500)
    },

    setIframeHeight(height = undefined) {
      const iframe = document.querySelector('iframe')
      iframe.height = '' + (height ?? this.getIframeHeight()) || '100%'
    },

    getIframeHeight() {
      return document.querySelector('iframe')?.contentWindow.document.body
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

      console.log('before', templateString)

      templateString = templateString.replaceAll(
        /{{#(?<type>[^}]+)}}\s?(?<content>[\S\s]+?){{\/(\1)}}/gm,
        (match, type, content) => {
          const hasEmptyField = fields.some(
            (field) => type === field.name && field.fieldValue === '',
          )
          return hasEmptyField ? '' : content
        },
      )

      console.log('after', templateString)

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
          console.log('url src', url)
          this.preloadImage(url)
          return `loading="lazy" src="${url}" onerror="this.src = '';this.onerror='';" `
        },
      )

      return field
    },
  },
}
</script>
