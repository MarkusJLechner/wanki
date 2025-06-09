<template>
  <div>
    <TheHeader title="Edit Card" back-button>
      <FlexSpacer />
      <BtnPreviewCard :card="previewCard" @preview="onPreview" />
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
        <div>
          <label class="mb-1 block text-sm font-bold">Front Template</label>
          <textarea
            v-model="front"
            class="w-full rounded border p-2 font-mono"
            rows="6"
          ></textarea>
        </div>
        <div>
          <label class="mb-1 block text-sm font-bold">Back Template</label>
          <textarea
            v-model="back"
            class="w-full rounded border p-2 font-mono"
            rows="6"
          ></textarea>
        </div>
        <div>
          <label class="mb-1 block text-sm font-bold">CSS</label>
          <textarea
            v-model="css"
            class="w-full rounded border p-2 font-mono"
            rows="6"
          ></textarea>
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
import { wankidb } from '@/plugins/wankidb/db'
import BtnPreviewCard from 'components/BtnPreviewCard.vue'
import { toastSuccess } from 'store/globalstate.ts'
import type { Card } from 'plugins/wankidb/Card.ts'

const route = useRoute()
const router = useRouter()

const card = ref<Card | null>(null)
const template = ref<any>(null)
const model = ref<any>(null)
const decks = ref<any[]>([])
const selectedDeck = ref<number>(0)
const front = ref('')
const back = ref('')
const css = ref('')
const previewCard = ref<any>(null)

const computedIsLoading = computed(
  () => !card.value || !template.value || !model.value,
)

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

  template.value = await card.value.template
  model.value = await card.value.model

  front.value = template.value.qfmt || ''
  back.value = template.value.afmt || ''
  css.value = model.value.css || ''

  decks.value = await wankidb.decks.toArray()
  selectedDeck.value = card.value.did || 0
})

const onSave = async () => {
  if (!card.value || !template.value || !model.value) {
    return
  }

  card.value.did = selectedDeck.value

  // Update template values
  template.value.qfmt = front.value
  template.value.afmt = back.value

  // Update CSS in model
  model.value.css = css.value
  await model.value.save()

  // Use the new setTemplate method to update the template in the card
  await card.value.setTemplate(template.value)

  // Save the card
  await card.value.save()

  toastSuccess('Saved')
  await router.push(`/review/on?deckid=${selectedDeck.value}`)
}

const modelFromInputs = async () => {
  if (!model.value) {
    throw new Error('Model is undefined')
  }

  return { ...model.value, css: css.value }
}

const templateFromInputs = async () => {
  if (!template.value) {
    throw new Error('Template is undefined')
  }

  return { ...template.value, qfmt: front.value, afmt: back.value }
}

const cardFromInputs = async () => {
  if (!card.value || !template.value || !model.value) {
    return
  }

  return {
    ...card.value,
    template: Promise.resolve(templateFromInputs()),
    model: Promise.resolve(modelFromInputs()),
    fields: card.value.fields,
    note: card.value.note,
  }
}

const onPreview = async () => {
  if (!card.value || !template.value || !model.value) {
    return
  }

  previewCard.value = await cardFromInputs()
}
</script>

<style scoped></style>
