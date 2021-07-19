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
      <InformationHeaderReview class="" :current="2" :timer="timerText" />

      <div id="review-container" class="flex-grow p-3">
        <div class="text-yellow-500">Deck ID: {{ deckid }}</div>
        <div class="text-yellow-400 mb-1">Deck Name: {{ deck.name }}</div>

        <div v-if="note" class="text-xs">
          <div class="text-blue-300 font-bold">Card:</div>
          <div>id: {{ card.id }}</div>
          <div>nid: {{ card.nid }}</div>
          <div>did: {{ card.did }}</div>
          <div>ord: {{ card.ord }}</div>
          <div>mod: {{ card.mod }}</div>
          <div>usn: {{ card.usn }}</div>
          <div>type: {{ card.type }}</div>
          <div>queue: {{ card.queue }}</div>
          <div>due: {{ card.due }}</div>
          <div>ivl: {{ card.ivl }}</div>
          <div>factor: {{ card.factor }}</div>
          <div>reps: {{ card.reps }}</div>
          <div>lapses: {{ card.lapses }}</div>
          <div>left: {{ card.left }}</div>
          <div>odue: {{ card.odue }}</div>
          <div>odid: {{ card.odid }}</div>
          <div>flags: {{ card.flags }}</div>
          <div>data: {{ card.data }}</div>
          <div>cardType: {{ card.cardType }}</div>
          <div>queueType: {{ card.queueType }}</div>
          <div class="text-blue-300 font-bold">NOTE:</div>
          <div v-html="getFields().join(' ')"></div>
          <div>Tags: {{ note.tags }}</div>
          <div>flags: {{ note.flags }}</div>
          <div>usn: {{ note.usn }}</div>
          <div>csum: {{ note.csum }}</div>
          <div>mid: {{ note.mid }}</div>
          <div>mod: {{ note.mod }}</div>
          <div class="text-blue-300 font-bold">DECK:</div>
          <div>browserCollapsed: {{ deck.browserCollapsed }}</div>
          <div>collapsed: {{ deck.collapsed }}</div>
          <div>conf: {{ deck.conf }}</div>
          <div>desc: {{ deck.desc }}</div>
          <div>dyn: {{ deck.dyn }}</div>
          <div>extendNew: {{ deck.extendNew }}</div>
          <div>extendRev: {{ deck.extendRev }}</div>
          <div>id: {{ deck.id }}</div>
          <div>lrnToday: {{ deck.lrnToday }}</div>
          <div>mod: {{ deck.mod }}</div>
          <div>name: {{ deck.name }}</div>
          <div>newToday: {{ deck.newToday }}</div>
          <div>revToday: {{ deck.revToday }}</div>
          <div>timeToday: {{ deck.timeToday }}</div>
          <div>usn: {{ deck.usn }}</div>
        </div>
      </div>

      <ButtonsReview
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
import { createTimer, sleep } from '@/plugins/global.js'
import InformationHeaderReview from '@/components/InformationHeaderReview.vue'
import MainContent from '@/components/MainContent.vue'
import { addToast } from '@/store/globalstate.js'
import { wankidb } from '@/plugins/wankidb/db.js'
import { Ease } from '@/plugins/conts.js'
import { answerCard } from '@/plugins/scheduler.js'

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
      card: null,
      note: null,
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
    this.loadFirstCard()
    addToast({ type: 'info', text: 'Started review' })
    this.timer.start()
  },

  unmounted() {
    console.log('unload')
  },

  methods: {
    async loadFirstCard() {
      this.card = await wankidb.cards.get({ did: this.deckid })
      await this.loadNote()

      console.log(this.card)
    },

    async loadNote() {
      if (this.card) {
        this.note = await this.card.note
      }
    },

    getFields() {
      if (!this.note) {
        return []
      }

      return this.note.flds.split('\u001fa')
    },

    async loadCard(cardId) {
      this.card = await wankidb.cards.get({ id: cardId })
      await this.loadNote()
    },

    onClickOptions(item) {
      console.log(item)
    },

    onShow() {
      this.showAnswer = true
    },

    async onRating(ease) {
      await sleep(200)
      this.timer.reset()
      this.showAnswer = false

      if (!this.card) {
        return
      }
      await answerCard(this.card, ease)
    },
  },
}
</script>
