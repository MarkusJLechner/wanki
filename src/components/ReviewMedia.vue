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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ReviewAudio from '@/components/ReviewAudio.vue'
import { refstorage } from '@/store/globalstate'
import { defaultSettings } from '@/plugins/defaultSettings.js'

interface Props {
  mediaList?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  mediaList: () => []
})

const currentIndex = ref(0)

const useAlignAudioButtonsRight = computed(() => {
  return refstorage.getSetting(
    defaultSettings.reviewing.alignAudioButtonsRight
  )
})

watch(() => props.mediaList, () => {
  currentIndex.value = 0
})
</script>
