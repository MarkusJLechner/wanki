<template>
  <div v-if="blobFile">
    <div v-if="mediaType !== 'audio/mp3'">
      <img :src="blobFile" class="w-52" />
    </div>
    <audio
      v-else
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
      @click="playLoadedAudio"
    />
  </div>
</template>

<script>
import { refstorage } from '@/store/globalstate.js'
import { defaultSettings } from '@/plugins/defaultSettings.js'
import ButtonIcon from '@/components/ButtonIcon.vue'
import { getFileMimeType, sleep } from '@/plugins/global.js'

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
      mediaType: 'audio/mp3',
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

    useAutoPlayAudio() {
      return refstorage.getSetting(defaultSettings.reviewing.autoPlayAudio)
    },

    getAudioStartDelay() {
      return +refstorage.getSetting(
        defaultSettings.reviewing.autoPlayAudioDelay,
      )
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

    autoplay(newValue, oldValue) {
      console.log(newValue, oldValue)
      if (!oldValue && newValue) {
        this.playLoadedAudio()
      }
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
            const blob = new Blob([dbObj.file])
            const type = getFileMimeType(dbObj.file)

            console.log({ type, blob, fileMediaGet: dbObj.file })
            this.mediaType = type

            this.blobFile = URL.createObjectURL(blob)
          } else {
            this.notFound = true
            this.blobFile = null
          }
        })
      }

      await this.playLoadedAudio()
    },

    onEnded() {
      this.isPlaying = false
      this.$emit('ended')
    },

    onPlay() {
      this.isPlaying = true
    },

    async playLoadedAudio() {
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
      if (this.autoplay && this.useAutoPlayAudio) {
        await sleep(+this.getAudioStartDelay)
        this.playPromise = this.$refs.audio.play().catch((e) => {
          console.error([this.blobFile], e)
        })
        await this.playPromise
      }
      this.playPromise = null
      this.isPlaying = true
    },
  },
}
</script>
