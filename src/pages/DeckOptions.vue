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
import { ref, watch, onMounted, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { wankidb } from '@/plugins/wankidb/db'
import { NewCardOrder, Leech } from '@/plugins/conts'
import { refstorage } from '@/store/globalstate'
import TheHeader from '@/components/TheHeader.vue'
import MainContent from '@/components/MainContent.vue'
import Group from '@/components/Group.vue'
import List from '@/components/List.vue'

const route = useRoute()
const router = useRouter()

const deck = ref<any>(null)
const dconf = ref<any>(null)
const deckid = ref(1)

const newPerDay = refstorage.ref('deck.options.new.perDay')
const maxReviews = refstorage.ref('deck.options.rev.perDay')
const ignoreReviewLimit = refstorage.ref('deck.options.new.ignoreReviewLimit')
const newSteps = refstorage.ref('deck.options.new.steps')
const newOrder = refstorage.ref('deck.options.new.order')
const lapseSteps = refstorage.ref('deck.options.lapse.steps')
const leechThreshold = refstorage.ref('deck.options.lapse.leechThreshold')
const leechAction = refstorage.ref('deck.options.lapse.leechAction')

const orderItems = [
  { text: 'Random', value: NewCardOrder.Random },
  { text: 'Sequential (oldest first)', value: NewCardOrder.Due },
]

const lapseActionItems = [
  { text: 'Tag only', value: Leech.TagOnly },
  { text: 'Suspend card', value: Leech.Suspend },
]

interface ListItem {
  text: string
  subtext?: string
  toggle?: string
  toggleDefault?: boolean
  icon?: string
  kind?: string
  key?: string
  placeholder?: string
  type?: string
  title?: string
  radio?: {
    title: string
    key: string
    default: string | number
    items: Array<{
      text: string
      value: string | number
    }>
  }
  click?: (item: any) => void
}

const listItemsDailyLimits: ListItem[] = [
  {
    text: 'New cards/day',
    kind: 'textfield',
    type: 'number',
    key: 'deck.options.new.perDay',
    title: 'New cards/day',
    click: () => {
      if (dconf.value) {
        dconf.value.new = dconf.value.new || {}
        dconf.value.new.perDay = newPerDay.value
        save()
      }
    },
  },
  {
    text: 'Maximum reviews/day',
    kind: 'textfield',
    type: 'number',
    key: 'deck.options.rev.perDay',
    title: 'Maximum reviews/day',
    click: () => {
      if (dconf.value) {
        dconf.value.rev = dconf.value.rev || {}
        dconf.value.rev.perDay = maxReviews.value
        save()
      }
    },
  },
  {
    text: 'New cards ignore review limit',
    toggle: 'deck.options.new.ignoreReviewLimit',
    toggleDefault: false,
    click: () => {
      if (dconf.value) {
        dconf.value.new = dconf.value.new || {}
        dconf.value.new.ignoreReviewLimit = !dconf.value.new.ignoreReviewLimit
        ignoreReviewLimit.value = dconf.value.new.ignoreReviewLimit
        save()
      }
    },
  },
]

const listItemsNewCards: ListItem[] = [
  {
    text: 'Learning steps',
    kind: 'textfield',
    placeholder: 'e.g. 1m 10m 1h 4d',
    key: 'deck.options.new.steps',
    title: 'Learning steps',
    click: () => {
      if (dconf.value) {
        dconf.value.new = dconf.value.new || {}
        dconf.value.new.delays = parseSteps(newSteps.value)
        save()
      }
    },
  },
  {
    text: 'New cards order',
    radio: {
      title: 'New cards order',
      key: 'deck.options.new.order',
      default: NewCardOrder.Due,
      items: orderItems,
    },
    click: () => {
      if (dconf.value) {
        dconf.value.new = dconf.value.new || {}
        dconf.value.new.order = newOrder.value
        save()
      }
    },
  },
]

const listItemsLapses: ListItem[] = [
  {
    text: 'Relearning steps',
    kind: 'textfield',
    placeholder: 'e.g. 10m 1h',
    key: 'deck.options.lapse.steps',
    title: 'Relearning steps',
    click: () => {
      if (dconf.value) {
        dconf.value.lapse = dconf.value.lapse || {}
        dconf.value.lapse.delays = parseSteps(lapseSteps.value)
        save()
      }
    },
  },
  {
    text: 'Leech threshold',
    kind: 'textfield',
    type: 'number',
    key: 'deck.options.lapse.leechThreshold',
    title: 'Leech threshold',
    click: () => {
      if (dconf.value) {
        dconf.value.lapse = dconf.value.lapse || {}
        dconf.value.lapse.leechFails = leechThreshold.value
        save()
      }
    },
  },
  {
    text: 'Leech action',
    radio: {
      title: 'Leech action',
      key: 'deck.options.lapse.leechAction',
      default: Leech.Suspend,
      items: lapseActionItems,
    },
    click: () => {
      if (dconf.value) {
        dconf.value.lapse = dconf.value.lapse || {}
        dconf.value.lapse.leechAction = leechAction.value
        save()
      }
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

watch(newPerDay, (v) => {
  if (!dconf.value) return
  dconf.value.new = dconf.value.new || {}
  dconf.value.new.perDay = +v
  save()
})

watch(maxReviews, (v) => {
  if (!dconf.value) return
  dconf.value.rev = dconf.value.rev || {}
  dconf.value.rev.perDay = +v
  save()
})

watch(ignoreReviewLimit, (v) => {
  if (!dconf.value) return
  dconf.value.new = dconf.value.new || {}
  dconf.value.new.ignoreReviewLimit = v
  save()
})

watch(newSteps, (v) => {
  if (!dconf.value) return
  dconf.value.new = dconf.value.new || {}
  dconf.value.new.delays = parseSteps(v)
  save()
})

watch(newOrder, (v) => {
  if (!dconf.value) return
  dconf.value.new = dconf.value.new || {}
  dconf.value.new.order = +v
  save()
})

watch(lapseSteps, (v) => {
  if (!dconf.value) return
  dconf.value.lapse = dconf.value.lapse || {}
  dconf.value.lapse.delays = parseSteps(v)
  save()
})

watch(leechThreshold, (v) => {
  if (!dconf.value) return
  dconf.value.lapse = dconf.value.lapse || {}
  dconf.value.lapse.leechFails = +v
  save()
})

watch(leechAction, (v) => {
  if (!dconf.value) return
  dconf.value.lapse = dconf.value.lapse || {}
  dconf.value.lapse.leechAction = +v
  save()
})

onMounted(async () => {
  deckid.value = +(route.query.deckid as string) || 1
  deck.value = await wankidb.decks.get({ id: deckid.value })
  if (!deck.value) {
    router.push({ path: '/' })
    return
  }
  dconf.value = await wankidb.dconf.get({ id: deck.value.conf || 1 })
  if (!dconf.value) return

  newPerDay.value = dconf.value.new?.perDay ?? null
  maxReviews.value = dconf.value.rev?.perDay ?? null
  ignoreReviewLimit.value = dconf.value.new?.ignoreReviewLimit ?? false
  newSteps.value = formatSteps(dconf.value.new?.delays || [])
  newOrder.value = dconf.value.new?.order ?? NewCardOrder.Due
  lapseSteps.value = formatSteps(dconf.value.lapse?.delays || [])
  leechThreshold.value = dconf.value.lapse?.leechFails ?? null
  leechAction.value = dconf.value.lapse?.leechAction ?? Leech.Suspend

  // Set initial values for refstorage
  if (dconf.value.new?.perDay !== undefined) {
    refstorage.set('deck.options.new.perDay', dconf.value.new.perDay)
  }
  if (dconf.value.rev?.perDay !== undefined) {
    refstorage.set('deck.options.rev.perDay', dconf.value.rev.perDay)
  }
  if (dconf.value.new?.ignoreReviewLimit !== undefined) {
    refstorage.set(
      'deck.options.new.ignoreReviewLimit',
      dconf.value.new.ignoreReviewLimit,
    )
  }
  if (dconf.value.new?.delays) {
    refstorage.set(
      'deck.options.new.steps',
      formatSteps(dconf.value.new.delays),
    )
  }
  if (dconf.value.new?.order !== undefined) {
    refstorage.set('deck.options.new.order', dconf.value.new.order)
  }
  if (dconf.value.lapse?.delays) {
    refstorage.set(
      'deck.options.lapse.steps',
      formatSteps(dconf.value.lapse.delays),
    )
  }
  if (dconf.value.lapse?.leechFails !== undefined) {
    refstorage.set(
      'deck.options.lapse.leechThreshold',
      dconf.value.lapse.leechFails,
    )
  }
  if (dconf.value.lapse?.leechAction !== undefined) {
    refstorage.set(
      'deck.options.lapse.leechAction',
      dconf.value.lapse.leechAction,
    )
  }
})
</script>
