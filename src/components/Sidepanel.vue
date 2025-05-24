<template>
  <div>
    <ButtonIcon class="toggle-button" icon="fas fa-bars" @click="toggle()" />

    <transition name="fade">
      <div
        v-if="show"
        class="
          bg-gray-900/50
          z-20
          fixed
          w-full
          h-full
          top-0
          left-0
          backdrop-grayscale
        "
        @click="onClose()"
      ></div>
    </transition>
    <nav
      ref="slide"
      :class="{ open: show }"
      class="
        slide-parent
        fixed
        left-0
        top-0
        flex flex-col
        bg-white
        dark:bg-gray-700
        h-full
        w-64
        shadow-md
        z-20
      "
    >
      <slot name="slide-content">
        <List no-separation no-gutters :value="items" @item="onClick" />
      </slot>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated } from 'vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import List from '@/components/List.vue'
import { onBeforeRouteLeave } from 'vue-router'

interface TouchState {
  threshold: number
  screenWidth: number
  screenHeight: number
  init: boolean
  onSlide: boolean
  initSlideClientX: number
  initSlideClientY: number
  initClientX: number
  initClientY: number
  clientX: number
  clientY: number
  distanceX: number
  distanceY: number
}

interface Props {
  items?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => []
})

const slideXPosition = ref(52)
const show = ref(false)
const slide = ref<HTMLElement | null>(null)

const touch = ref<TouchState>({
  threshold: 50,
  screenWidth: 0,
  screenHeight: 0,
  init: false,
  onSlide: false,
  initSlideClientX: 0,
  initSlideClientY: 0,
  initClientX: 0,
  initClientY: 0,
  clientX: 0,
  clientY: 0,
  distanceX: 0,
  distanceY: 0
})

const onTouchmove = (event: TouchEvent) => {
  if (!touch.value.init || show.value) {
    return
  }
  const { clientX, clientY } = getClientPos(event)
  touch.value.clientX = clientX
  touch.value.clientY = clientY
  touch.value.distanceX = Math.abs(touch.value.initClientX - clientX)
  touch.value.distanceY = Math.abs(touch.value.initClientY - clientY)

  if (touch.value.distanceX > touch.value.threshold) {
    onOpen()
    touch.value.init = false
  }
}

const getClientPos = (event: TouchEvent) => {
  let { clientX, clientY } = event.touches[0]
  clientX = Math.floor(clientX)
  clientY = Math.floor(clientY)
  return { clientX, clientY }
}

const onTouchdown = (event: TouchEvent) => {
  if (show.value) {
    return
  }
  const { clientX, clientY } = getClientPos(event)
  touch.value.init = clientX < slideXPosition.value
  const { width: screenWidth, height: screenHeight } = window.screen

  touch.value.initClientX = clientX
  touch.value.initClientY = clientY
  touch.value.screenWidth = screenWidth
  touch.value.screenHeight = screenHeight
}

const toggle = () => {
  if (show.value) {
    onClose()
  } else {
    onOpen()
  }
}

const onOpen = () => {
  show.value = true
}

const onClick = (item: any) => {
  if (!item.doNotClose) {
    onClose()
  }
}

const onClose = () => {
  show.value = false
}

onMounted(() => {
  document.addEventListener('touchstart', onTouchdown)
  document.addEventListener('touchmove', onTouchmove)

  onBeforeRouteLeave(() => {
    if (show.value) {
      onClose()
      return false
    }

    return true
  })
})

onActivated(() => {
  onClose()
})

onUnmounted(() => {
  document.removeEventListener('touchstart', onTouchdown)
  document.removeEventListener('touchmove', onTouchmove)
})
</script>

<style scoped>
.slide-parent {
  transition: 0.2s transform ease-in-out;
  transform: translateX(-100%);
}

.slide-parent.open {
  transform: translateX(0%);
}
</style>
