<template>
  <div v-if="deck" class="w-screen">
    <TheHeader>
      <FlexSpacer />
      <ThemeSwitcher />
      <ButtonIcon icon="far fa-flag" />
      <ButtonIcon icon="fas fa-info-circle" />
      <ButtonIcon icon="fas fa-microphone" />
      <ButtonIcon icon="fas fa-arrow-alt-circle-right" />
      <ButtonIcon icon="far fa-star" @click="debug = !debug" />
      <ButtonOptions
        :value="[
          { value: 'undo', text: 'Undo' },
          { value: 'enable-whiteboard', text: 'Enable whiteboard' },
          { value: 'add-note', text: 'Add note' },
          { value: 'edit-tags', text: 'Edit tags' },
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
      <InformationHeaderReview class="" :current="2" :timer="timerText" />

      <div id="review-container" class="grow p-3 relative">
        <ReviewDebug v-if="debug" :card="card" :deck="deck" />

        <ReviewContainer :show-answer="showAnswer" :card="card" />
      </div>

      <ButtonsReview
        class="z-20"
        :show-rating="showAnswer"
        @show="onShow"
        @rating="onRating"
      />
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import ButtonOptions from '@/components/ButtonOptions.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import ButtonsReview from '@/components/ButtonsReview.vue'
import { createTimer } from '@/plugins/global'
import InformationHeaderReview from '@/components/InformationHeaderReview.vue'
import MainContent from '@/components/MainContent.vue'
import { addToast } from '@/store/globalstate'
import { wankidb } from '@/plugins/wankidb/db.js'
import { ToastType } from '@/plugins/conts.js'
import { answerCard } from '@/plugins/scheduler.js'
import ReviewDebug from '@/components/ReviewDebug.vue'
import ReviewContainer from '@/components/ReviewContainer.vue'

const router = useRouter()
const route = useRoute()

const debug = ref(false)
const deckid = ref(1)
const deck = ref(null)
const card = ref(null)
const note = ref(null)
const showAnswer = ref(false)
const timer = ref(null)
const timerText = ref('00:00')
const timerDuration = ref(0)

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
  deck.value = await wankidb.decks.get({ id: deckid.value })
  if (!deck.value) {
    await router.push({ path: '/' })
  }
}

// Load first card
const loadFirstCard = async () => {
  const count = await wankidb.cards.where({ did: deckid.value }).count()
  const pages = count / 5
  const randPage = Math.floor(pages * Math.random())
  console.log('load random', { count, pages, randPage })

  card.value = await wankidb.cards
    .where({ did: deckid.value })
    .offset(randPage)
    .limit(5)
    .first()

  console.log(card.value)
}

const onClickOptions = (item) => {
  console.log(item)
}

const onShow = () => {
  showAnswer.value = true
}

const onRating = async (ease) => {
  timer.value.reset()

  if (!card.value) {
    return
  }
  try {
    await answerCard(card.value, ease)
    await loadFirstCard()

    showAnswer.value = false
  } catch (e) {
    console.error(e)
  }
}

// Initialize data
void initializeData()

// Lifecycle hooks
onMounted(() => {
  loadFirstCard()
  addToast({ type: ToastType.info, text: 'Started review' })
  timer.value.start()
})

onUnmounted(() => {
  console.log('unload')
})
</script>
