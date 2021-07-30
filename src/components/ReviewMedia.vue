<template>
  <div
    class="flex gap-3 overflow-x-auto"
    :class="{ 'flex-row-reverse': useAlignAudioButtonsRight }"
  >
    <ReviewAudio
      v-for="(file, index) in mediaList"
      :key="file.name"
      :db-media-string="file.media"
      :autoplay="currentIndex === index"
      @ended="currentIndex++"
    />
  </div>
</template>

<script>
import ReviewAudio from '@/components/ReviewAudio.vue'
import { refstorage } from '@/store/globalstate.js'
import { defaultSettings } from '@/plugins/defaultSettings.js'
export default {
  name: 'ReviewMedia',
  components: { ReviewAudio },
  props: {
    mediaList: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      currentIndex: 0,
    }
  },

  computed: {
    useAlignAudioButtonsRight() {
      return refstorage.getSetting(
        defaultSettings.reviewing.alignAudioButtonsRight,
      )
    },
  },

  watch: {
    mediaList() {
      this.currentIndex = 0
    },
  },

  mounted() {},

  methods: {},
}
</script>
