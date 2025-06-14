<template>
  <div v-if="deck" class="w-screen">
    <TheHeader>
      <FlexSpacer />
      <ThemeSwitcher />
      <ButtonIcon
        icon="fas fa-spider"
        :show-dot="showDebugDot"
        @click="toggleDebugging"
      />
      <ButtonIcon icon="fas fa-undo" @click="onUndo" />
      <ButtonIcon icon="fas fa-info-circle" @click="onInfo" />
      <ButtonOptions
        :value="[
          { value: 'undo', text: 'Undo' },
          { value: 'enable-whiteboard', text: 'Enable whiteboard' },
          { value: 'add-note', text: 'Add note' },
          { value: 'edit-tags', text: 'Edit tags' },
          { value: 'edit-card', text: 'Edit card' },
          { value: 'edit-template', text: 'Edit template' },
          { value: 'replay-audio', text: 'Replay audio' },
          { value: 'suspend-card', text: 'Suspend card' },
          { value: 'delete-note', text: 'Delete note' },
          { value: 'reschedule', text: 'Reschedule' },
          { value: 'deck-options', text: 'Deck options' },
          { value: 'set-tts-language', text: 'Set TTS language' },
        ]"
        @item="onClickOptions"
      />
    </TheHeader>

    <MainContent>
      <InformationHeaderReview
        class=""
        :current="current"
        :remaining="remaining"
        :timer="timerText"
      />

      <div id="review-container" class="relative grow p-3">
        <template v-if="card">
          <ReviewDebug v-if="debug" :card="card" :deck="deck" />

          <DebuggingTimeControls
            v-if="debug"
            position="bottom-left"
            :on-time-change="loadNextCard"
          />

          <ReviewContainer :show-answer="showAnswer" :card="card" />
        </template>
        <div v-else class="p-4 text-center text-gray-500 dark:text-gray-300">
          No cards for review
        </div>
      </div>

      <ButtonsReview
        v-if="card"
        class="z-20"
        :show-rating="showAnswer"
        :show-due="showAnswer"
        :due="dueText"
        @show="onShow"
        @rating="onRating"
      />
      <div
        v-else
        class="review-height sticky bottom-0 z-20 flex w-full bg-gray-500/50 backdrop-blur-xs select-none"
      >
        <div
          v-ripple
          role="button"
          class="flex h-28 w-full items-center justify-center text-white"
          @click="goOverview"
        >
          To overview
        </div>
      </div>
    </MainContent>
    <div
      v-show="undoProgress > 0"
      class="pointer-events-none fixed inset-0 z-30 flex items-center pl-6"
      :style="{ opacity: Math.min(undoProgress, 1) }"
    >
      <i class="fas fa-undo text-5xl text-white" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import ButtonOptions from '@/components/ButtonOptions.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import ButtonsReview from '@/components/ButtonsReview.vue'
import { createTimer } from '@/plugins/global'
import type { Timer } from '@/plugins/global'
import InformationHeaderReview from '@/components/InformationHeaderReview.vue'
import MainContent from '@/components/MainContent.vue'
import { wankidb } from '@/plugins/wankidb/db'
import { CardType, QueueType } from '@/plugins/consts'
import { answerCard, previewCard } from '@/plugins/fsrs'
import { getNextCard, getDueCounts } from '@/plugins/reviewer'
import ReviewDebug from '@/components/ReviewDebug.vue'
import ReviewContainer from '@/components/ReviewContainer.vue'
import DebuggingTimeControls from '@/components/DebuggingTimeControls.vue'
import type { Deck } from 'plugins/wankidb/Deck.ts'
import type { Card } from 'plugins/wankidb/Card.ts'
import { refstorage } from '@/store/globalstate'
import { getTimeOffset } from '@/plugins/time'
import type { ItemButtonOption } from 'components/ButtonOptions.ts'
import { useSwipeGesture } from '@/plugins/useGesture'

const router = useRouter()
const route = useRoute()

// Initialize debugging state in refstorage if not already initialized
refstorage.init('testing.debugging', false)
// Use computed to reactively get the debugging state from refstorage
const debug = computed(() => refstorage.get('testing.debugging', false))
const showDebugDot = computed(() => getTimeOffset() !== 0)
const deckid = ref(1)
const deck = ref<Deck | undefined>(undefined)
const card = ref<Card | undefined>(undefined)
const showAnswer = ref(false)
const timer = ref<Timer | null>(null)
const timerText = ref('00:00')
const timerDuration = ref(0)
const remaining = ref([0, 0, 0])
const current = ref(0)
const dueText = ref<string[]>([])
const { progress: undoProgress } = useSwipeGesture({
  direction: 'right',
  threshold: 100,
  onTrigger: onUndo,
})

function formatDue(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000))
  if (sec < 3600) {
    return Math.round(sec / 60) + 'm'
  }
  if (sec < 86400) {
    return Math.round(sec / 3600) + 'h'
  }
  return Math.round(sec / 86400) + 'd'
}

function updateDueText() {
  if (!card.value) {
    dueText.value = []
    return
  }
  const deltas = previewCard(card.value)
  dueText.value = deltas.map((ms) => formatDue(ms))
}
const undoStack: Array<{
  card: Partial<Card>
  deck: Partial<Deck>
  revlogId?: number
}> = []

// Initialize timer and load deck
timer.value = createTimer({
  duration: 60,
  callback: (duration, text) => {
    timerDuration.value = duration
    timerText.value = text
  },
  runOnStart: false,
})

// Load deck (previously in created hook)
const initializeData = async () => {
  deckid.value = +(route.query.deckid as string) || 1
  deck.value = (await wankidb.decks.get({ id: deckid.value })) as
    | Deck
    | undefined
  if (!deck.value) {
    await router.push({ path: '/' })
  }
}

// Load next card for review
const cardTypeIndex = (c: any): number => {
  if (!c) {
    return -1
  }
  if (c.queue === QueueType.New || c.type === CardType.New) {
    return 0
  }
  if (
    c.queue === QueueType.Learn ||
    c.queue === QueueType.DayLearnRelearn ||
    c.type === CardType.Learn
  ) {
    return 2
  }
  return 1
}

const loadNextCard = async () => {
  card.value = await getNextCard(deckid.value)
  remaining.value = await getDueCounts(deckid.value)
  current.value = cardTypeIndex(card.value)
  updateDueText()
}

// Toggle debugging mode using refstorage
const toggleDebugging = () => {
  refstorage.toggle('testing.debugging')
}

const onClickOptions = (item: ItemButtonOption) => {
  const value = item?.value
  if (!value) {
    throw new Error('No value')
  }
  if (!card.value) {
    return
  }

  if (value === 'undo') {
    void onUndo()
    return
  }

  if (value === 'edit-card') {
    void router.push({ path: '/card/edit', query: { cardid: card.value.id } })
    return
  }

  if (value === 'edit-template') {
    void router.push({
      path: '/template/edit',
      query: { cardid: card.value.id },
    })
    return
  }
}

const onInfo = () => {
  if (!card.value) {
    return
  }
  void router.push({ path: '/card/info', query: { cardid: card.value.id } })
}

async function onUndo() {
  const entry = undoStack.pop()
  if (!entry) {
    return
  }

  if (entry.revlogId) {
    await wankidb.revlog.delete(entry.revlogId)
  }

  if (entry.deck) {
    // following throws error. but is this needed?
    // why save back to deck?
    //await wankidb.decks.put(entry.deck)
    //deck.value = (await wankidb.decks.get({ id: entry.deck.id })) as Deck
  }

  if (entry.card) {
    await wankidb.cards.put(entry.card)
    const prevCard = (await wankidb.cards.get({
      id: entry.card.id,
    })) as Card | undefined
    if (prevCard) {
      card.value = prevCard
      current.value = cardTypeIndex(prevCard)
    }
  }

  remaining.value = await getDueCounts(deckid.value)
  showAnswer.value = false
  timer.value.reset()
}

const onShow = () => {
  showAnswer.value = true
}

const goOverview = () => {
  void router.push({ path: '/' })
}

const onRating = async (ease) => {
  timer.value.reset()

  if (!card.value) {
    return
  }
  try {
    const undoEntry: { card: any; deck: any; revlogId?: number } = {
      card: card.value.getObj(),
      deck: deck.value ? deck.value.getObj() : {},
    }

    await answerCard(card.value, ease)

    const lastLog = await wankidb.revlog.where({ cid: card.value.id }).last()
    undoEntry.revlogId = lastLog?.id
    undoStack.push(undoEntry)

    await loadNextCard()

    showAnswer.value = false
  } catch (e) {
    console.error(e)
  }
}

watch(card, updateDueText)
watch(showAnswer, (v) => {
  if (v) updateDueText()
})

// Initialize data
void initializeData()

// Lifecycle hooks
onMounted(() => {
  void loadNextCard()
  // addToast({ type: ToastType.info, text: 'Started review' })
  timer.value?.start()
})

onUnmounted(() => {
  console.log('unload')
})
</script>
