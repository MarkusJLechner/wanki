<template>
  <div>
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

  computed: {},

  watch: {
    mediaList() {
      this.currentIndex = 0
    },
  },

  mounted() {},

  methods: {},
}
</script>
