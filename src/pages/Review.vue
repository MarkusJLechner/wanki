<template>
  <div v-if="deck">
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
    <div class="text-yellow-500">Deck ID: {{ deckid }}</div>
    <div class="text-yellow-400">Deck Name: {{ deck.name }}</div>
  </div>
</template>

<script>
import TheHeader from 'components/TheHeader.vue'
import FlexSpacer from 'components/FlexSpacer.vue'
import ThemeSwitcher from 'components/ThemeSwitcher.vue'
import ButtonOptions from '@/components/ButtonOptions.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'

export default {
  components: {
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
    }
  },

  async created() {
    console.log('load')
    this.deckid = +this.$route.query.deckid
    this.deck = await wankidb.decks.get({ id: this.deckid })
    if (!this.deck) {
      await this.$router.push({ path: '/' })
    }
  },

  unmounted() {
    console.log('unload')
  },

  methods: {
    onClickOptions(item) {
      console.log(item)
    },
  },
}
</script>
