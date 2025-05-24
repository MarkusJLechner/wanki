<template>
  <div v-if="blobFile" class="w-full">
    <div v-if="!isAudio">
      <img loading="lazy" alt="image" :src="blobFile" class="w-52" />
    </div>
    <div v-else class="w-full">
      <audio
        ref="audio"
        class="w-full"
        :controls="audioContols"
        @ended="onEnded"
      />
      <ButtonIcon
        v-if="!useNativeAudioControls"
        :icon="computedIcon"
        class="bg-gray-400 p-3 w-14 h-14 text-sm shadow-md"
        @click="doPlayAudio"
      />
    </div>
  </div>
</template>

<script>
import { refstorage } from '@/store/globalstate'
import { defaultSettings } from '@/plugins/defaultSettings.js'
import ButtonIcon from '@/components/ButtonIcon.vue'
import { getFileMimeType, sleep } from '@/plugins/global'

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
    isAudio() {
      return this.mediaType === 'audio/mp3'
    },

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

      if (!this.isAudio) {
        setTimeout(() => {
          this.onEnded()
        }, 200)
      }

      await this.playLoadedAudio()
    },

    onEnded() {
      this.isPlaying = false
      this.$emit('ended')
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
      this.$refs.audio.load()
      if (this.autoplay && this.useAutoPlayAudio) {
        await sleep(+this.getAudioStartDelay)
        await this.doPlayAudio().catch((e) => {
          console.error([this.blobFile], e)
        })
      }
      this.playPromise = null
    },

    async doPlayAudio() {
      if (!this.$refs.audio) {
        return
      }
      this.isPlaying = true
      this.$refs.audio.currentTime = 0
      this.playPromise = this.$refs.audio.play()
      await this.playPromise
    },
  },
}
</script>
