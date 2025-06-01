<template>
  <div>
    <TheHeader title="Deck Options" back-button />
    <MainContent>
      <Group value="Daily Limits">
        <List :value="listItemsDailyLimits" />
      </Group>

      <Group value="New Cards" class="mt-4">
        <List :value="listItemsNewCards" />
      </Group>

      <Group value="Lapses" class="mt-4">
        <List :value="listItemsLapses" />
      </Group>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { wankidb } from '@/plugins/wankidb/db'
import { NewCardOrder, Leech } from '@/plugins/consts'
import TheHeader from '@/components/TheHeader.vue'
import MainContent from '@/components/MainContent.vue'
import Group from '@/components/Group.vue'
import List from '@/components/List.vue'
import type { ListItem } from '@/components/List'

const route = useRoute()
const router = useRouter()

const deck = ref<any>(null)
const dconf = ref<any>(null)
const deckid = ref(1)

const orderItems = [
  { text: 'Random', value: NewCardOrder.Random },
  { text: 'Sequential (oldest first)', value: NewCardOrder.Due },
]

const lapseActionItems = [
  { text: 'Tag only', value: Leech.TagOnly },
  { text: 'Suspend card', value: Leech.Suspend },
]

const listItemsDailyLimits: ListItem[] = [
  {
    text: 'New cards/day',
    kind: 'textfield',
    label: 'New cards per day',
    type: 'number',
    storeDb: {
      get: () => dconf.value?.new.perDay,
      save: (value) => {
        dconf.value.new.perDay = +value
        void save()
      },
    },
    title: 'New cards/day',
  },
  {
    text: 'Maximum reviews/day',
    kind: 'textfield',
    type: 'number',
    storeDb: {
      get: () => dconf.value?.rev?.perDay,
      save: (value) => {
        dconf.value.rev = dconf.value.rev || {}
        dconf.value.rev.perDay = +value
        void save()
      },
    },
    title: 'Maximum reviews/day',
  },
  {
    text: 'New cards ignore review limit',
    storeDb: {
      get: () => dconf.value?.new?.ignoreReviewLimit ?? false,
      save: (value: boolean) => {
        dconf.value.new = dconf.value.new || {}
        dconf.value.new.ignoreReviewLimit = value
        void save()
      },
    },
  },
]

const listItemsNewCards: ListItem[] = [
  {
    text: 'Learning steps',
    kind: 'textfield',
    placeholder: 'e.g. 1m 10m 1h 4d',
    storeDb: {
      get: () => formatSteps(dconf.value?.new?.delays || []),
      save: (value) => {
        dconf.value.new = dconf.value.new || {}
        dconf.value.new.delays = parseSteps(value)
        void save()
      },
    },
    title: 'Learning steps',
  },
  {
    text: 'New cards order',
    radio: {
      title: 'New cards order',
      key: 'deck.options.new.order',
      default: NewCardOrder.Due,
      items: orderItems,
    },
    storeDb: {
      get: () => dconf.value?.new?.order ?? NewCardOrder.Due,
      save: (value) => {
        dconf.value.new = dconf.value.new || {}
        dconf.value.new.order = +value
        void save()
      },
    },
  },
]

const listItemsLapses: ListItem[] = [
  {
    text: 'Relearning steps',
    kind: 'textfield',
    placeholder: 'e.g. 10m 1h',
    storeDb: {
      get: () => formatSteps(dconf.value?.lapse?.delays || []),
      save: (value) => {
        dconf.value.lapse = dconf.value.lapse || {}
        dconf.value.lapse.delays = parseSteps(value)
        void save()
      },
    },
    title: 'Relearning steps',
  },
  {
    text: 'Leech threshold',
    kind: 'textfield',
    type: 'number',
    storeDb: {
      get: () => dconf.value?.lapse?.leechFails,
      save: (value) => {
        dconf.value.lapse = dconf.value.lapse || {}
        dconf.value.lapse.leechFails = +value
        void save()
      },
    },
    title: 'Leech threshold',
  },
  {
    text: 'Leech action',
    radio: {
      title: 'Leech action',
      key: 'deck.options.lapse.leechAction',
      default: Leech.Suspend,
      items: lapseActionItems,
    },
    storeDb: {
      get: () => dconf.value?.lapse?.leechAction ?? Leech.Suspend,
      save: (value) => {
        dconf.value.lapse = dconf.value.lapse || {}
        dconf.value.lapse.leechAction = +value
        void save()
      },
    },
  },
]

function formatSteps(steps: number[] = []) {
  return steps
    .map((m) => {
      if (m % 1440 === 0) return m / 1440 + 'd'
      if (m % 60 === 0) return m / 60 + 'h'
      return m + 'm'
    })
    .join(' ')
}

function parseSteps(str: string): number[] {
  return str
    .split(/[, ]+/)
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/(\d+)([smhd]?)/)
      if (!m) return 0
      let v = +m[1]
      const unit = m[2]
      if (unit === 'd') v *= 1440
      else if (unit === 'h') v *= 60
      else if (unit === 's') v = Math.floor(v / 60)
      return v
    })
}

async function save() {
  if (dconf.value) {
    await wankidb.dconf.put(toRaw(dconf.value))
  }
}

onMounted(async () => {
  deckid.value = +(route.query.deckid as string) || 1
  deck.value = await wankidb.decks.get({ id: deckid.value })
  if (!deck.value) {
    void router.push({ path: '/' })
    return
  }
  dconf.value = await wankidb.dconf.get({ id: deck.value.conf || 1 })
})
</script>
