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
        class="h-14 w-14 bg-gray-400 p-3 text-sm shadow-md"
        @click="doPlayAudio"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { refstorage } from '@/store/globalstate'
import { defaultSettings } from '@/plugins/defaultSettings.js'
import ButtonIcon from '@/components/ButtonIcon.vue'
import { getFileMimeType, sleep } from '@/plugins/global'
import { wankidb } from '@/plugins/wankidb/db.js'

interface Props {
  blob?: string | null
  objectUrl?: string | null
  dbMediaString?: string | null
  autoplay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  blob: null,
  objectUrl: null,
  dbMediaString: null,
  autoplay: true,
})

const emit = defineEmits<{
  ended: []
}>()

const audio = ref<HTMLAudioElement | null>(null)
const blobFile = ref<string | null>(null)
const isPlaying = ref(false)
const playPromise = ref<Promise<void> | null>(null)
const notFound = ref(false)
const mediaType = ref('audio/mp3')

const isAudio = computed(() => {
  return mediaType.value === 'audio/mp3'
})

const computedIcon = computed(() => {
  if (isPlaying.value) {
    return 'fas fa-pause'
  }

  if (notFound.value) {
    return 'fas fa-question'
  }

  return 'fas fa-play'
})

const useNativeAudioControls = computed(() => {
  return refstorage.getSetting(defaultSettings.reviewing.audioControls)
})

const useAutoPlayAudio = computed(() => {
  return refstorage.getSetting(defaultSettings.reviewing.autoPlayAudio)
})

const getAudioStartDelay = computed(() => {
  return +refstorage.getSetting(defaultSettings.reviewing.autoPlayAudioDelay)
})

const audioContols = computed(() => {
  return useNativeAudioControls.value ? 'controls' : undefined
})

const hasRefAudio = computed(() => {
  return !!audio.value
})

watch(
  () => props.blob,
  () => {
    loadAudio()
  },
)

watch(
  () => props.objectUrl,
  () => {
    loadAudio()
  },
)

watch(
  () => props.dbMediaString,
  () => {
    loadAudio()
  },
)

watch(
  () => props.autoplay,
  (newValue, oldValue) => {
    if (!oldValue && newValue) {
      playLoadedAudio()
    }
  },
)

onMounted(() => {
  loadAudio()
})

async function loadAudio() {
  blobFile.value = null
  if (props.blob) {
    blobFile.value = URL.createObjectURL(new Blob([props.blob]))
  }
  if (props.objectUrl) {
    blobFile.value = props.objectUrl
  }
  if (props.dbMediaString) {
    await wankidb.media.get({ name: props.dbMediaString }).then((dbObj) => {
      if (dbObj) {
        const blob = new Blob([dbObj.file])
        const type = getFileMimeType(dbObj.file)

        console.log({ type, blob, fileMediaGet: dbObj.file })
        mediaType.value = type

        blobFile.value = URL.createObjectURL(blob)
      } else {
        notFound.value = true
        blobFile.value = null
      }
    })
  }

  if (!isAudio.value) {
    setTimeout(() => {
      onEnded()
    }, 200)
  }

  await playLoadedAudio()
}

function onEnded() {
  isPlaying.value = false
  emit('ended')
}

async function playLoadedAudio() {
  await nextTick()

  if (!hasRefAudio.value) {
    return
  }
  if (playPromise.value) {
    await playPromise.value
  }
  audio.value!.src = blobFile.value || ''
  audio.value!.load()
  if (props.autoplay && useAutoPlayAudio.value) {
    await sleep(+getAudioStartDelay.value)
    await doPlayAudio().catch((e) => {
      console.error([blobFile.value], e)
    })
  }
  playPromise.value = null
}

async function doPlayAudio() {
  if (!audio.value) {
    return
  }
  isPlaying.value = true
  audio.value.currentTime = 0
  playPromise.value = audio.value.play()
  await playPromise.value
}
</script>
