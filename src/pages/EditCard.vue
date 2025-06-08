<template>
  <div>
    <TheHeader title="Edit Card" back-button>
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>
    <MainContent>
      <div v-if="!computedIsLoading" class="space-y-4 p-4">
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
        <div class="pt-2">
          <Button text="Save" @click="onSave" />
        </div>
      </div>

      <div v-if="computedIsLoading" class="p-4">Loading...</div>
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

const route = useRoute()
const router = useRouter()

const card = ref<any>(null)
const template = ref<any>(null)
const model = ref<any>(null)
const decks = ref<any[]>([])
const selectedDeck = ref<number>(0)
const front = ref('')
const back = ref('')
const css = ref('')

const computedIsLoading = computed(() => !card || !template || !model)

onMounted(async () => {
  const cid = +(route.query.cardid as string) || 0
  if (!cid) return

  card.value = await wankidb.cards.get({ id: cid })
  if (!card.value) return

  template.value = await card.value.template
  model.value = await card.value.model

  front.value = template.value.qfmt || ''
  back.value = template.value.afmt || ''
  css.value = model.value.css || ''

  decks.value = await wankidb.decks.toArray()
  selectedDeck.value = card.value.did || 0
})

const onSave = async () => {
  if (!card.value || !template.value || !model.value) return

  card.value.did = selectedDeck.value
  template.value.qfmt = front.value
  template.value.afmt = back.value
  model.value.css = css.value

  await card.value.save()
  await wankidb.models.put(model.value)

  await router.push({ path: '/card/info', query: { cardid: card.value.id } })
}
</script>

<style scoped></style>
