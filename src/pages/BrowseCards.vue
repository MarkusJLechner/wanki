<template>
  <div>
    <TheHeader :title="deckName || 'Browse Cards'" back-button>
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>
    <MainContent>
      <div class="p-4">
        <InputTextField v-model="search" placeholder="Search" />
      </div>
      <List :value="listItems" item-text-key="text" @item="onCard"> </List>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import MainContent from '@/components/MainContent.vue'
import List from '@/components/List.vue'
import InputTextField from '@/components/InputTextField.vue'
import { wankidb } from '@/plugins/wankidb/db'

const route = useRoute()

interface CardEntry {
  text: string
  subtext: string
  searchText: string
  cardId: number
}

const deckId = ref<number>(0)
const deckName = ref('')
const cards = ref<CardEntry[]>([])
const search = ref('')

function stripCardText(html: string): string {
  if (!html) return ''
  let result = html.replace(/\[[^\]]*\]/g, ' ')
  result = result.replace(/<[^>]*>/g, ' ')
  result = result.replace(/\s+/g, ' ').trim()
  if (result.length > 80) {
    result = result.slice(0, 80) + '...'
  }
  return result
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString()
}

onMounted(async () => {
  deckId.value = +(route.query.deckid as string) || 0
  const deck = await wankidb.decks.get({ id: deckId.value })
  deckName.value = deck?.name || 'Browse Cards'

  const deckCards = await wankidb.cards.where({ did: deckId.value }).toArray()
  const entries: CardEntry[] = []
  for (const card of deckCards) {
    const note = await card.note
    const firstField = (note.flds || '').split('\u001f')[0] || ''
    const text =
      stripCardText(firstField) ||
      stripCardText((note.flds || '').replace(/\u001f/g, ' ')) ||
      '[empty]'
    const dueDate = await card.dueDate
    const cardTypeText: string = card.cardType ?? ''
    entries.push({
      text,
      subtext: `${cardTypeText} · ${formatDate(dueDate.getTime())}`,
      searchText: stripCardText(
        (note.flds || '').replace(/\u001f/g, ' '),
      ).toLowerCase(),
      cardId: card.id as number,
    })
  }
  cards.value = entries
})

const filteredCards = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return cards.value
  return cards.value.filter((c) => c.searchText.includes(term))
})

const listItems = computed(() =>
  filteredCards.value.map((c) => ({
    text: c.text,
    subtext: c.subtext,
    route: '/card/info',
    routeQuery: { cardid: c.cardId },
  })),
)

function onCard(_item: any): void {
  // navigation handled via item.route
}
</script>

<style scoped></style>
