<template>
  <div v-if="deck" class="w-screen">
    <TheHeader>
      <FlexSpacer />
      <ThemeSwitcher />
      <ButtonIcon icon="far fa-flag" />
      <ButtonIcon icon="fas fa-info-circle" />
      <ButtonIcon icon="fas fa-microphone" />
      <ButtonIcon icon="fas fa-arrow-alt-circle-right" />
      <ButtonIcon icon="far fa-star" />
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
      <InformationHeaderReview :current="2" :timer="timerText" />

      <div class="text-yellow-500">Deck ID: {{ deckid }}</div>
      <div class="text-yellow-400">Deck Name: {{ deck.name }}</div>
    </MainContent>

    <ButtonsReview
      :show-rating="showAnswer"
      @show="onShow"
      @rating="onRating"
    />
  </div>
</template>

<script>
import TheHeader from 'components/TheHeader.vue'
import FlexSpacer from 'components/FlexSpacer.vue'
import ThemeSwitcher from 'components/ThemeSwitcher.vue'
import ButtonOptions from '@/components/ButtonOptions.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import ButtonsReview from '@/components/ButtonsReview.vue'
import { createTimer, sleep } from '@/plugins/global.js'
import InformationHeaderReview from '@/components/InformationHeaderReview.vue'
import MainContent from '@/components/MainContent.vue'

export default {
  components: {
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
      deckid: 1,
      deck: null,
      showAnswer: false,
      timer: null,
      timerText: '00:00',
      timerDuration: 0,
    }
  },

  async created() {
    console.log('load')
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
    this.timer.start()
  },

  unmounted() {
    console.log('unload')
  },

  methods: {
    onClickOptions(item) {
      console.log(item)
    },

    onShow() {
      this.showAnswer = true
    },

    async onRating(value) {
      await sleep(200)
      this.timer.reset()
      this.showAnswer = false
    },
  },
}
</script>
