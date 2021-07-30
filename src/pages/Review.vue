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

      <div id="review-container" class="flex-grow p-3 relative">
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

<script>
import TheHeader from 'components/TheHeader.vue'
import FlexSpacer from 'components/FlexSpacer.vue'
import ThemeSwitcher from 'components/ThemeSwitcher.vue'
import ButtonOptions from '@/components/ButtonOptions.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import ButtonsReview from '@/components/ButtonsReview.vue'
import { createTimer } from '@/plugins/global.js'
import InformationHeaderReview from '@/components/InformationHeaderReview.vue'
import MainContent from '@/components/MainContent.vue'
import { addToast } from '@/store/globalstate.js'
import { wankidb } from '@/plugins/wankidb/db.js'
import { ToastType } from '@/plugins/conts.js'
import { answerCard } from '@/plugins/scheduler.js'
import ReviewDebug from '@/components/ReviewDebug.vue'
import ReviewContainer from '@/components/ReviewContainer.vue'

export default {
  components: {
    ReviewContainer,
    ReviewDebug,
    MainContent,
    InformationHeaderReview,
    ButtonsReview,
    ButtonIcon,
    ButtonOptions,
    ThemeSwitcher,
    FlexSpacer,
    TheHeader,
  },

  data() {
    return {
      debug: false,
      deckid: 1,
      deck: null,
      card: null,
      note: null,
      showAnswer: false,
      timer: null,
      timerText: '00:00',
      timerDuration: 0,
    }
  },

  async created() {
    this.timer = createTimer({
      duration: 60,
      callback: (timerDuration, timerText) => {
        this.timerDuration = timerDuration
        this.timerText = timerText
      },
      runOnStart: false,
    })

    this.deckid = +this.$route.query.deckid
    this.deck = await wankidb.decks.get({ id: this.deckid })
    if (!this.deck) {
      await this.$router.push({ path: '/' })
    }
  },

  mounted() {
    this.loadFirstCard()
    addToast({ type: ToastType.info, text: 'Started review' })
    this.timer.start()
  },

  unmounted() {
    console.log('unload')
  },

  methods: {
    async loadFirstCard() {
      const count = await wankidb.cards.where({ did: this.deckid }).count()
      const pages = count / 5
      const randPage = Math.floor(pages * Math.random())
      console.log('load random', { count, pages, randPage })

      this.card = await wankidb.cards
        .where({ did: this.deckid })
        .offset(randPage)
        .limit(5)
        .first()

      console.log(this.card)
    },

    onClickOptions(item) {
      console.log(item)
    },

    onShow() {
      this.showAnswer = true
    },

    async onRating(ease) {
      this.timer.reset()

      if (!this.card) {
        return
      }
      try {
        await answerCard(this.card, ease)
        await this.loadFirstCard()

        this.showAnswer = false
      } catch (e) {
        console.error(e)
      }
    },
  },
}
</script>
