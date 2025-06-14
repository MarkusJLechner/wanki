<template>
  <div>
    <TheHeader title="Edit Card" back-button>
      <FlexSpacer />
      <BtnPreviewCard :card="previewCard" @preview="onPreview" />
      <ButtonIcon icon="fas fa-code" @click="onEditTemplate" />
      <ThemeSwitcher />
    </TheHeader>
    <MainContent>
      <div v-if="!computedIsLoading" class="space-y-4 p-4 pb-10">
        <div>
          <label class="mb-1 block text-sm font-bold">Deck</label>
          <select
            v-model.number="selectedDeck"
            class="w-full rounded border p-2"
          >
            <option v-for="d in decks" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
        </div>
        <div v-for="(f, i) in fields" :key="i">
          <label class="mb-1 block text-sm font-bold">{{ f.name }}</label>
          <CodeEditor v-model="fieldValues[i]" language="html" class="w-full" />
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
import ButtonIcon from '@/components/ButtonIcon.vue'
import { wankidb } from '@/plugins/wankidb/db'
import BtnPreviewCard from 'components/BtnPreviewCard.vue'
import { toastSuccess } from 'store/globalstate.ts'
import type { Card } from 'plugins/wankidb/Card.ts'

const route = useRoute()
const router = useRouter()

const card = ref<Card | null>(null)
const note = ref<any>(null)
const fields = ref<any[]>([])
const fieldValues = ref<string[]>([])
const decks = ref<any[]>([])
const selectedDeck = ref<number>(0)
const previewCard = ref<any>(null)

const computedIsLoading = computed(() => !card.value || !note.value)

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

  note.value = await card.value.note
  fields.value = await card.value.fields
  fieldValues.value = fields.value.map((f: any) => f.fieldValue)

  decks.value = await wankidb.decks.toArray()
  selectedDeck.value = card.value.did || 0
})

const onSave = async () => {
  if (!card.value || !note.value) {
    return
  }

  card.value.did = selectedDeck.value
  await card.value.save()

  note.value.flds = fieldValues.value.join('\u001f')
  note.value.sfld = fieldValues.value[0] || ''
  await note.value.save()

  toastSuccess('Saved')
  await router.push(`/review/on?deckid=${selectedDeck.value}`)
}

const cardFromInputs = async () => {
  if (!card.value || !note.value) {
    return
  }

  const tmpNote = { ...note.value, flds: fieldValues.value.join('\u001f') }
  const tmpFields = fields.value.map((f: any, i: number) => ({
    ...f,
    fieldValue: fieldValues.value[i],
  }))

  return {
    ...card.value,
    template: card.value.template,
    model: card.value.model,
    fields: Promise.resolve(tmpFields),
    note: Promise.resolve(tmpNote),
  }
}

const onPreview = async () => {
  if (!card.value || !note.value) {
    return
  }

  previewCard.value = await cardFromInputs()
}

const onEditTemplate = () => {
  if (!card.value) return
  void router.push({ path: '/template/edit', query: { cardid: card.value.id } })
}
</script>

<style scoped></style>
