<template>
  <audio
    v-if="blobFile"
    ref="audio"
    class="w-full"
    :controls="audioContols"
    @ended="onEnded"
    @playing="onPlay"
  />
  <ButtonIcon
    v-if="!useNativeAudioControls"
    :icon="computedIcon"
    class="bg-gray-400 p-3 w-14 h-14 text-sm shadow-md"
    @click="startAudio"
  />
</template>

<script>
import { refstorage } from '@/store/globalstate.js'
import { defaultSettings } from '@/plugins/defaultSettings.js'
import ButtonIcon from '@/components/ButtonIcon.vue'

export default {
  name: 'ReviewAudio',
  components: { ButtonIcon },
  props: {
    blob: {
      type: String,
      default: null,
    },

    objectUrl: {
      type: String,
      default: null,
    },

    dbMediaString: {
      type: String,
      default: null,
    },

    autoplay: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      blobFile: null,
      isPlaying: false,
      playPromise: null,
      notFound: false,
    }
  },

  computed: {
    computedIcon() {
      if (this.isPlaying) {
        return 'fas fa-pause'
      }

      if (this.notFound) {
        return 'fas fa-question'
      }

      return 'fas fa-play'
    },

    useNativeAudioControls() {
      return refstorage.getSetting(defaultSettings.reviewing.audioControls)
    },

    audioContols() {
      return this.useNativeAudioControls ? 'controls' : undefined
    },

    hasRefAudio() {
      return !!this.$refs.audio
    },
  },

  watch: {
    blob() {
      this.loadAudio()
    },

    objectUrl() {
      this.loadAudio()
    },

    dbMediaString() {
      this.loadAudio()
    },
  },

  mounted() {
    this.loadAudio()
  },

  methods: {
    async loadAudio() {
      this.blobFile = null
      if (this.blob) {
        this.blobFile = URL.createObjectURL(new Blob([this.blob]))
      }
      if (this.objectUrl) {
        this.blobFile = this.objectUrl
      }
      if (this.dbMediaString) {
        await wankidb.media.get({ name: this.dbMediaString }).then((dbObj) => {
          if (dbObj) {
            this.blobFile = URL.createObjectURL(new Blob([dbObj.file]))
          } else {
            this.notFound = true
            this.blobFile = null
          }
        })
      }

      if (this.autoplay) {
        await this.startAudio()
      }
    },

    onEnded() {
      this.isPlaying = false
      this.$emit('ended')
    },

    onPlay() {
      this.isPlaying = true
    },

    async startAudio() {
      await this.$nextTick

      if (!this.hasRefAudio) {
        return
      }
      if (this.playPromise) {
        await this.playPromise
      }
      this.$refs.audio.src = [this.blobFile]
      this.$refs.audio.currentTime = 0
      this.$refs.audio.load()
      this.playPromise = this.$refs.audio.play().catch((e) => {
        console.error(e)
      })
      await this.playPromise
      this.playPromise = null
      this.isPlaying = true
    },
  },
}
</script>
