<template>
  <div>
    <ButtonIcon class="toggle-button" icon="fas fa-bars" @click="toggle()" />

    <transition name="fade">
      <div
        v-if="show"
        class="
          bg-gray-900 bg-opacity-50
          z-20
          fixed
          w-full
          h-full
          top-0
          left-0
          backdrop-grayscale backdrop-filter
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

<script>
import ButtonIcon from 'components/ButtonIcon.vue'
import List from 'components/List.vue'
import { onBeforeRouteLeave } from 'vue-router'

export default {
  components: {
    List,
    ButtonIcon,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      slideXPosition: 52,
      show: false,
      touch: {
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
        distanceY: 0,
      },
    }
  },

  mounted() {
    document.addEventListener('touchstart', this.onTouchdown)
    document.addEventListener('touchmove', this.onTouchmove)

    onBeforeRouteLeave(() => {
      if (this.show) {
        this.onClose()
        return false
      }

      return true
    })
  },

  activated() {
    this.onClose()
  },

  unmounted() {
    document.removeEventListener('touchstart', this.onTouchdown)
    document.removeEventListener('touchmove', this.onTouchmove)
  },

  methods: {
    onTouchmove(event) {
      if (!this.touch.init || this.show) {
        return
      }
      const { clientX, clientY } = this.getClientPos(event)
      this.touch.clientX = clientX
      this.touch.clientY = clientY
      this.touch.distanceX = Math.abs(this.touch.initClientX - clientX)
      this.touch.distanceY = Math.abs(this.touch.initClientY - clientY)

      if (this.touch.distanceX > this.touch.threshold) {
        this.onOpen()
        this.touch.init = false
      }
    },

    getClientPos(event) {
      let { clientX, clientY } = event.touches[0]
      clientX = Math.floor(clientX)
      clientY = Math.floor(clientY)
      return { clientX, clientY }
    },

    onTouchdown(event) {
      if (this.show) {
        return
      }
      const { clientX, clientY } = this.getClientPos(event)
      this.touch.init = clientX < this.slideXPosition
      const { width: screenWidth, height: screenHeight } = window.screen

      this.touch.initClientX = clientX
      this.touch.initClientY = clientY
      this.touch.screenWidth = screenWidth
      this.touch.screenHeight = screenHeight
    },

    toggle() {
      if (this.show) {
        this.onClose()
      } else {
        this.onOpen()
      }
    },

    onOpen() {
      this.show = true
    },

    onClick(item) {
      if (!item.doNotClose) {
        this.onClose()
      }
    },

    onClose() {
      this.show = false
    },
  },
}
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
