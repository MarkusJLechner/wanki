<template>
  <div>
    <TheHeader title="Edit Template" back-button>
      <FlexSpacer />
      <BtnPreviewCard :card="previewCard" @preview="onPreview" />
      <ThemeSwitcher />
    </TheHeader>
    <MainContent>
      <div v-if="!computedIsLoading" class="space-y-4 p-4 pb-10">
        <div>
          <label class="mb-1 block text-sm font-bold">Fields</label>
          <div
            v-for="(f, i) in fields"
            :key="i"
            class="flex items-center space-x-2"
          >
            <InputTextField v-model="f.name" class="grow" />
            <ButtonIcon icon="fas fa-trash" @click="removeField(i)" />
          </div>
          <Button text="Add Field" @click="addField" />
        </div>
        <hr />
        <div v-for="(tmpl, i) in templates" :key="i" class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-bold"
              >Front Template {{ i + 1 }}</label
            >
            <CodeEditor v-model="tmpl.qfmt" language="html" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold"
              >Back Template {{ i + 1 }}</label
            >
            <CodeEditor v-model="tmpl.afmt" language="html" class="w-full" />
          </div>
          <hr class="my-4" />
        </div>
        <Button text="Add Template" @click="addTemplate" />
        <div>
          <label class="mb-1 block text-sm font-bold">CSS</label>
          <CodeEditor v-model="css" language="css" class="w-full" />
        </div>
      </div>

      <div v-if="computedIsLoading" class="p-4">Loading...</div>

      <div
        class="sticky right-0 bottom-0 left-0 flex space-x-2 bg-gray-500/50 px-2 backdrop-blur-xs"
      >
        <Button
          class="grow"
          text="Save"
          @click="onSave"
          :loading="computedIsLoading"
        />
      </div>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import MainContent from '@/components/MainContent.vue'
import Button from '@/components/Button.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import CodeEditor from '@/components/CodeEditor.vue'
import InputTextField from '@/components/InputTextField.vue'
import { wankidb } from '@/plugins/wankidb/db'
import BtnPreviewCard from 'components/BtnPreviewCard.vue'
import { toastSuccess } from 'store/globalstate.ts'
import type { Card } from 'plugins/wankidb/Card.ts'

const route = useRoute()
const router = useRouter()

const card = ref<Card | null>(null)
const model = ref<any>(null)
const templates = ref<any[]>([])
const fields = ref<any[]>([])
const css = ref('')
const previewCard = ref<any>(null)

const computedIsLoading = computed(() => !card.value || !model.value)

onMounted(async () => {
  const cid = +(route.query.cardid as string) || 0
  if (!cid) {
    return
  }

  card.value =
    ((await wankidb.cards.get({ id: cid })) as Card | undefined) ?? null
  if (!card.value) {
    return
  }

  model.value = await card.value.model
  if (model.value) {
    templates.value = model.value.tmpls
      ? model.value.tmpls.map((t: any) => ({ ...t }))
      : []
    fields.value = model.value.flds
      ? model.value.flds.map((f: any) => ({ ...f }))
      : []
    css.value = model.value.css || ''
  }
})

const onSave = async () => {
  if (!model.value) {
    return
  }

  model.value.css = css.value
  model.value.tmpls = templates.value.map((t, i) => ({ ...t, ord: i }))
  model.value.flds = fields.value.map((f, i) => ({ ...f, ord: i }))
  await model.value.save()

  toastSuccess('Saved')
  await router.push(`/review/on?deckid=${card.value?.did}`)
}

const modelFromInputs = async () => {
  if (!model.value) {
    throw new Error('Model is undefined')
  }
  const newModel: any = {
    ...model.value,
    css: css.value,
    tmpls: templates.value.map((t, i) => ({ ...t, ord: i })),
    flds: fields.value.map((f, i) => ({ ...f, ord: i })),
  }
  return newModel
}

const cardFromInputs = async () => {
  if (!card.value || !model.value) {
    return
  }

  const tmpl = templates.value[card.value.ord ?? 0]
  const note = await card.value.note
  const values = note.flds?.split('\u001f') || []
  const tmpFields = fields.value.map((f, i) => ({
    ...f,
    fieldValue: values[i] || '',
  }))
  return {
    ...card.value,
    template: Promise.resolve(tmpl),
    model: Promise.resolve(modelFromInputs()),
    fields: Promise.resolve(tmpFields),
    note: Promise.resolve(note),
  }
}

const onPreview = async () => {
  if (!card.value || !model.value) {
    return
  }

  previewCard.value = await cardFromInputs()
}

const addTemplate = () => {
  templates.value.push({
    qfmt: '',
    afmt: '',
    name: '',
    ord: templates.value.length,
  })
}

const addField = () => {
  fields.value.push({ name: '', ord: fields.value.length })
}

const removeField = (index: number) => {
  fields.value.splice(index, 1)
}
</script>

<style scoped></style>
