<template>
  <div class="absolute top-0 left-0 z-10 h-full w-full">
    <div class="fixed bottom-28 w-full px-4">
      <ReviewMedia :media-list="computedSoundList" />
    </div>
  </div>
  <div class="relative h-full w-full">
    <IFrameContainer
      :body-class="computedDarkTheme"
      class="w-full"
      :css="computedStyle"
    >
      <span v-show="!showAnswer" class="card question" v-html="fieldQuestion" />
      <span v-show="showAnswer" class="card answer" v-html="fieldAnswer" />
    </IFrameContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  getMediaFromNote,
  replaceAsync,
  replaceMediaFromNote,
} from '@/plugins/global'
import IFrameContainer from '@/components/IFrameContainer'
import { refstorage } from '@/store/globalstate'
import ReviewMedia from '@/components/ReviewMedia.vue'
import { wankidb } from '@/plugins/wankidb/db'

interface Card {
  template: Promise<any>
  model: Promise<any>
  fields: Promise<any[]>
  note: Promise<any>
  [key: string]: any
}

interface Props {
  card?: Card | null
  showAnswer?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  card: null,
  showAnswer: false,
})

const fieldQuestion = ref('')
const fieldAnswer = ref('')
const cardStyle = ref('')
const soundListQuestion = ref<any[]>([])
const soundListAnswer = ref<any[]>([])

const computedSoundList = computed(() => {
  return props.showAnswer ? soundListAnswer.value : soundListQuestion.value
})

const computedDarkTheme = computed(() => {
  return refstorage.get('darkTheme', true) ? 'dark' : ''
})

const computedStyle = computed(() => {
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
      min-height: 100px;
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
    ${cardStyle.value}
  `
})

watch(
  () => props.card,
  () => {
    if (props.card) {
      mountNote()
    }
  },
)

async function mountNote() {
  if (!props.card) return

  const template = await props.card.template
  const model = await props.card.model
  const fields = await props.card.fields

  window.card = await props.card
  window.note = await props.card.note
  window.model = await props.card.model

  fieldQuestion.value = parseTemplate(template.qfmt, fields)
  fieldAnswer.value = parseTemplate(template.afmt, [
    { name: 'FrontSide', fieldValue: fieldQuestion.value },
    ...fields,
  ])

  soundListQuestion.value = getMediaList(fieldQuestion.value)
  soundListAnswer.value = getMediaList(fieldAnswer.value)

  fieldQuestion.value = await replaceImages(fieldQuestion.value)
  fieldQuestion.value = replaceMediaFromNote(fieldQuestion.value)
  fieldAnswer.value = await replaceImages(fieldAnswer.value)
  fieldAnswer.value = replaceMediaFromNote(fieldAnswer.value)

  cardStyle.value = model.css
}

function parseTemplate(templateString: string, fields: any[]) {
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
  const matches = []
  while ((m = regex.exec(templateString)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    matches.push(m)
  }

  matches.forEach((match) => {
    const templateField = match.groups?.field
    if (templateField) {
      const field = fields.find((f) => f.name === templateField)
      if (field) {
        templateString = templateString.replaceAll(
          `{{${templateField}}}`,
          field.fieldValue,
        )
      }
    }
  })

  return templateString
}

function getMediaList(field: string) {
  return getMediaFromNote(field)
}

function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = function () {
      // Update iframe height after image is loaded
      resolve(true)
    }
    img.onerror = function () {
      resolve(false)
    }
    img.src = url
  })
}

async function replaceImages(field: string) {
  field = await replaceAsync(
    field,
    /src\s*=\s*"(?<src>.+?)"/gm,
    async (src) => {
      src = src.slice(5, -1)
      const media = await wankidb.media.get({ name: src })
      const url = media ? URL.createObjectURL(new Blob([media.file])) : ''
      console.log('url src', url)
      preloadImage(url)
      return `loading="lazy" src="${url}" onerror="this.src = '';this.onerror='';" `
    },
  )

  return field
}

// Add global window type declaration
declare global {
  interface Window {
    card: any
    note: any
    model: any
  }
}
</script>
