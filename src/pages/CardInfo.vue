<template>
  <div>
    <TheHeader title="Card Info" backButton>
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>
    <MainContent>
      <div v-if="card && deck && note" class="space-y-2 p-4 text-sm">
        <div class="mb-4 rounded border p-4">
          <div
            class="mb-2 flex cursor-pointer items-center justify-between font-bold"
            @click="isExpanded = !isExpanded"
          >
            <span>Current Card</span>
            <i
              :class="['fas', isExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"
            ></i>
          </div>
          <div v-if="isExpanded">
            <div class="mb-2">{{ stripHtmlTags(note.flds) }}</div>
          </div>
        </div>

        <div><strong>Added:</strong> {{ formatDate(card.id) }}</div>
        <div><strong>First review:</strong> {{ firstReview || '-' }}</div>
        <div><strong>Latest review:</strong> {{ latestReview || '-' }}</div>
        <div><strong>Due:</strong> {{ due }}</div>
        <div><strong>Position:</strong> {{ card.due }}</div>
        <div><strong>Interval:</strong> {{ intervalText }}</div>
        <div><strong>Ease:</strong> {{ easePct }}%</div>
        <div><strong>Reviews:</strong> {{ card.reps }}</div>
        <div><strong>Lapses:</strong> {{ card.lapses }}</div>
        <div><strong>Average time:</strong> {{ avgTime.toFixed(1) }}s</div>
        <div><strong>Total time:</strong> {{ totalTime.toFixed(1) }}s</div>
        <div><strong>Card type:</strong> {{ card.cardType }}</div>
        <div><strong>Note type:</strong> {{ modelName }}</div>
        <div><strong>Deck:</strong> {{ deck.name }}</div>
        <div><strong>Card id:</strong> {{ card.id }}</div>
        <div><strong>Note id:</strong> {{ card.nid }}</div>
      </div>
      <div v-else class="p-4">Loading...</div>

      <div class="p-4">
        <h2 class="mb-2 font-bold">Review History</h2>
        <div v-if="!revlogs.length" class="text-gray-500 italic">
          No reviews
        </div>
        <table v-else class="w-full text-left text-sm">
          <thead>
            <tr class="border-b">
              <th class="py-1">Date</th>
              <th class="py-1">Type</th>
              <th class="py-1">Rating</th>
              <th class="py-1">Interval</th>
              <th class="py-1">Ease</th>
              <th class="py-1">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rev in revlogs" :key="rev.id" class="border-b">
              <td class="py-1">{{ formatDate(rev.id) }}</td>
              <td class="py-1">{{ revType(rev.type) }}</td>
              <td class="py-1">{{ rev.ease }}</td>
              <td class="py-1">{{ formatInterval(rev.ivl) }}</td>
              <td class="py-1">{{ (rev.factor / 10).toFixed(0) }}%</td>
              <td class="py-1">{{ (rev.time / 1000).toFixed(1) }}s</td>
            </tr>
          </tbody>
        </table>
      </div>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import MainContent from '@/components/MainContent.vue'
import { wankidb } from '@/plugins/wankidb/db'
import { CardType } from '@/plugins/conts.js'

const route = useRoute()

const isExpanded = ref(true)
const card = ref<any>(null)
const deck = ref<any>(null)
const note = ref<any>(null)
const modelName = ref('')
const revlogs = ref<any[]>([])
const firstReview = ref('')
const latestReview = ref('')
const due = ref('')
const intervalText = ref('')
const easePct = ref('')
const avgTime = ref(0)
const totalTime = ref(0)

function formatDate(ts: number) {
  return new Date(ts).toLocaleString()
}

function formatInterval(ivl: number) {
  if (ivl < 0) {
    return Math.abs(ivl) + 's'
  }
  if (ivl < 30) {
    return ivl + 'd'
  }
  if (ivl < 365) {
    return (ivl / 30).toFixed(1) + 'mo'
  }
  return (ivl / 365).toFixed(1) + 'y'
}

function revType(t: number) {
  return Object.keys(CardType).find((k) => CardType[k] === t) || t
}

function stripHtmlTags(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

onMounted(async () => {
  const cid = +(route.query.cardid as string) || 0
  if (!cid) return

  card.value = await wankidb.cards.get({ id: cid })
  if (!card.value) return

  note.value = await card.value.note
  deck.value = await card.value.deck
  const model = await card.value.model
  modelName.value = model?.name || ''

  const dueDate = await card.value.dueDate
  due.value = formatDate(dueDate.getTime())

  intervalText.value = formatInterval(card.value.ivl)
  easePct.value = (card.value.factor / 10).toFixed(0)

  revlogs.value = await wankidb.revlog.where({ cid }).sortBy('id')
  if (revlogs.value.length) {
    firstReview.value = formatDate(revlogs.value[0].id)
    latestReview.value = formatDate(revlogs.value[revlogs.value.length - 1].id)
    totalTime.value =
      revlogs.value.reduce((a, b) => a + (b.time || 0), 0) / 1000
    avgTime.value = totalTime.value / revlogs.value.length
  }
})
</script>

<style scoped></style>
