<template>
  <div>
    <TheHeader title="Add Note" back-button>
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>
    <MainContent>
      <div v-if="loaded" class="space-y-4 p-4">
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
          <label class="mb-1 block text-sm font-bold">Model</label>
          <select
            v-model.number="selectedModel"
            class="w-full rounded border p-2"
          >
            <option v-for="m in models" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
          </select>
        </div>
        <div v-for="(f, i) in fields" :key="i">
          <label class="mb-1 block text-sm font-bold">{{ f.name }}</label>
          <textarea
            v-model="fieldValues[i]"
            class="w-full rounded border p-2"
            rows="3"
          ></textarea>
        </div>
        <div class="pt-2">
          <Button text="Add" @click="onAdd" :loading="!loaded" />
        </div>
      </div>
      <div v-if="!loaded" class="p-4">Loading...</div>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import MainContent from '@/components/MainContent.vue'
import Button from '@/components/Button.vue'
import { wankidb } from '@/plugins/wankidb/db'
import { CardType, QueueType } from '@/plugins/consts'
import { now } from '@/plugins/time'
import { nanoid } from 'nanoid'
import { refstorage } from 'store/globalstate.ts'

const router = useRouter()

const decks = ref<any[]>([])
const models = ref<any[]>([])
const fields = ref<any[]>([])
const fieldValues = ref<string[]>([])
const selectedDeck = refstorage.ref('note.add.lastDeck', 0)
const selectedModel = refstorage.ref('note.add.lastModel', 0)
const loaded = ref(false)

onMounted(async () => {
  decks.value = await wankidb.decks.toArray()
  models.value = await wankidb.models.toArray()
  if (
    decks.value[0] &&
    (selectedDeck.value === 0 ||
      decks.value.every((d) => +d.id !== selectedDeck.value))
  ) {
    selectedDeck.value = +decks.value[0].id
  }

  if (
    models.value[0] &&
    (selectedModel.value === 0 ||
      models.value.every((m) => +m.id !== selectedModel.value))
  ) {
    selectedModel.value = +models.value[0].id
  }

  updateFields()

  loaded.value = true
})

watch(selectedModel, updateFields)

function updateFields() {
  const model = models.value.find((m: any) => m.id === selectedModel.value)
  fields.value = model?.flds || []
  fieldValues.value = fields.value.map(() => '')
}

async function onAdd() {
  const model = models.value.find((m: any) => m.id === selectedModel.value)
  if (!model) return
  const noteId = Date.now()
  const mod = Math.floor(now() / 1000)
  const note = {
    id: noteId,
    guid: nanoid(),
    mid: selectedModel.value,
    mod,
    usn: 0,
    tags: '',
    flds: fieldValues.value.join('\u001f'),
    sfld: fieldValues.value[0] || '',
    csum: 0,
    flags: 0,
    data: '',
  }
  await wankidb.notes.put(note as any)
  if (model.tmpls) {
    for (let i = 0; i < model.tmpls.length; i++) {
      const card = {
        id: noteId + i,
        nid: noteId,
        did: selectedDeck.value,
        ord: i,
        mod,
        usn: 0,
        type: CardType.New,
        queue: QueueType.New,
        due: 0,
        ivl: 0,
        factor: 2500,
        reps: 0,
        lapses: 0,
        left: 0,
        odue: 0,
        odid: 0,
        flags: 0,
        data: '',
      }
      await wankidb.cards.put(card as any)
    }
  }
  void router.push({ path: '/' })
}
</script>

<style scoped></style>
