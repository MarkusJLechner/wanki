<template>
  <audio
    v-if="blobFile"
    ref="audio"
    :controls="audioContols"
    :src="[blobFile]"
    preload="none"
    type="audio/mp3"
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
    blobFile: {
      immediate: false,
      async handler() {
        if (this.autoplay) {
          await this.startAudio()
        }
      },
    },
  },

  mounted() {
    this.loadAudio()
  },

  methods: {
    loadAudio() {
      if (this.blob) {
        this.blobFile = URL.createObjectURL(new Blob([this.blob]))
      }
      if (this.objectUrl) {
        this.blobFile = this.objectUrl
      }
      if (this.dbMediaString) {
        return wankidb.media.get({ name: this.dbMediaString }).then((dbObj) => {
          if (dbObj) {
            this.blobFile = URL.createObjectURL(new Blob([dbObj.file]))
          } else {
            this.notFound = true
          }
        })
      }
    },

    onEnded() {
      this.isPlaying = false
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
      this.playPromise = this.$refs.audio.play().catch((e) => console.error(e))
      await this.playPromise
      this.$refs.audio.currentTime = 0
      await this.$refs.audio.play()
      this.isPlaying = true
    },
  },
}
</script>
