<template>
  <div>
    <TheHeader title="Edit Template" back-button>
      <FlexSpacer />
      <BtnPreviewCard :card="previewCard" @preview="onPreview" />
      <ThemeSwitcher />
    </TheHeader>
    <MainContent>
      <div v-if="!computedIsLoading" class="space-y-4 p-4 pb-10">
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
import CodeEditor from '@/components/CodeEditor.vue'
import { wankidb } from '@/plugins/wankidb/db'
import BtnPreviewCard from 'components/BtnPreviewCard.vue'
import { toastSuccess } from 'store/globalstate.ts'
import type { Card } from 'plugins/wankidb/Card.ts'

const route = useRoute()
const router = useRouter()

const card = ref<Card | null>(null)
const model = ref<any>(null)
const templates = ref<any[]>([])
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
    css.value = model.value.css || ''
  }
})

const onSave = async () => {
  if (!model.value) {
    return
  }

  model.value.css = css.value
  if (model.value.tmpls) {
    for (let i = 0; i < templates.value.length; i++) {
      model.value.tmpls[i].qfmt = templates.value[i].qfmt
      model.value.tmpls[i].afmt = templates.value[i].afmt
    }
  }
  await model.value.save()

  toastSuccess('Saved')
  await router.push(`/review/on?deckid=${card.value?.did}`)
}

const modelFromInputs = async () => {
  if (!model.value) {
    throw new Error('Model is undefined')
  }
  const newModel: any = { ...model.value, css: css.value }
  if (model.value.tmpls) {
    newModel.tmpls = templates.value.map((t) => ({ ...t }))
  }
  return newModel
}

const cardFromInputs = async () => {
  if (!card.value || !model.value) {
    return
  }

  const tmpl = templates.value[card.value.ord ?? 0]
  return {
    ...card.value,
    template: Promise.resolve(tmpl),
    model: Promise.resolve(modelFromInputs()),
    fields: card.value.fields,
    note: card.value.note,
  }
}

const onPreview = async () => {
  if (!card.value || !model.value) {
    return
  }

  previewCard.value = await cardFromInputs()
}
</script>

<style scoped></style>
