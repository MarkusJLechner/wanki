<template>
  <div>
    <TheHeader title="Deck Options" back-button />
    <MainContent>
      <Group value="Daily Limits">
        <InputTextField
          label="New cards/day"
          type="number"
          v-model="newPerDay"
        />
        <InputTextField
          label="Maximum reviews/day"
          type="number"
          v-model="maxReviews"
        />
        <div class="flex items-center justify-between px-4">
          <span>New cards ignore review limit</span>
          <InputBoolean v-model="ignoreReviewLimit" />
        </div>
      </Group>

      <Group value="New Cards" class="mt-4">
        <InputTextField
          label="Learning steps"
          placeholder="e.g. 1m 10m 1h 4d"
          v-model="newSteps"
        />
        <InputRadio :items="orderItems" v-model="newOrder" />
      </Group>

      <Group value="Lapses" class="mt-4">
        <InputTextField
          label="Relearning steps"
          placeholder="e.g. 10m 1h"
          v-model="lapseSteps"
        />
        <InputTextField
          label="Leech threshold"
          type="number"
          v-model="leechThreshold"
        />
        <InputRadio :items="lapseActionItems" v-model="leechAction" />
      </Group>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { wankidb } from '@/plugins/wankidb/db.js'
import { NewCardOrder, Leech } from '@/plugins/conts.js'
import TheHeader from '@/components/TheHeader.vue'
import MainContent from '@/components/MainContent.vue'
import Group from '@/components/Group.vue'
import InputTextField from '@/components/InputTextField.vue'
import InputBoolean from '@/components/InputBoolean.vue'
import InputRadio from '@/components/InputRadio.vue'

const route = useRoute()
const router = useRouter()

const deck = ref<any>(null)
const dconf = ref<any>(null)
const deckid = ref(1)

const newPerDay = ref<number | null>(null)
const maxReviews = ref<number | null>(null)
const ignoreReviewLimit = ref(false)
const newSteps = ref('')
const newOrder = ref(NewCardOrder.Due)
const lapseSteps = ref('')
const leechThreshold = ref<number | null>(null)
const leechAction = ref(Leech.Suspend)

const orderItems = ref([
  { text: 'Random', value: NewCardOrder.Random },
  { text: 'Sequential (oldest first)', value: NewCardOrder.Due },
])

const lapseActionItems = ref([
  { text: 'Tag only', value: Leech.TagOnly },
  { text: 'Suspend card', value: Leech.Suspend },
])

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
    await wankidb.dconf.put(dconf.value)
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
})
</script>
