<template>
  <div>
    <ButtonIcon class="toggle-button" icon="fas fa-bars" @click="toggle()" />

    <transition name="fade">
      <div
        v-if="openState"
        class="
          bg-black bg-opacity-40
          z-10
          fixed
          w-full
          h-screen
          top-0
          left-0
          backdrop-blur-[4px] backdrop-filter
        "
        @mousedown.stop.prevent="close()"
        @touchstart.stop.prevent="close()"
      ></div>
    </transition>
    <nav
      ref="slide"
      :class="{ open: openState }"
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
      openState: false,
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
    document.addEventListener('touchstart', this.onTouchdown, { passive: true })
    document.addEventListener('touchmove', this.onTouchmove)
    document.addEventListener('touchend', this.onTouchend)
  },

  activated() {
    this.openState = false
  },

  unmounted() {
    document.removeEventListener('touchstart', this.onTouchdown)
  },

  methods: {
    onTouchend(event) {
      if (this.touch.onSlide) {
        event.preventDefault()
        event.stopImmediatePropagation()
      }
    },

    onTouchmove(event) {
      if (!this.touch.init) {
        return
      }
      const { clientX, clientY } = this.getClientPos(event)
      this.touch.clientX = clientX
      this.touch.clientY = clientY
      this.touch.distanceX = Math.abs(this.touch.initClientX - clientX)
      this.touch.distanceY = Math.abs(this.touch.initClientY - clientY)

      if (!this.touch.onSlide) {
        this.touch.initSlideClientX = clientX
        this.touch.initSlideClientY = clientY
      }

      if (this.touch.distanceX > this.touch.threshold) {
        this.touch.onSlide = true
        document.dispatchEvent(new Event('reset-long-press'))
      }

      if (this.touch.onSlide) {
        this.open()
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
      const { clientX, clientY } = this.getClientPos(event)
      this.touch.init = clientX < 32
      this.touch.onSlide = false
      const { width: screenWidth, height: screenHeight } = window.screen

      this.touch.initClientX = clientX
      this.touch.initClientY = clientY
      this.touch.screenWidth = screenWidth
      this.touch.screenHeight = screenHeight
    },

    toggle() {
      if (this.openState) {
        this.close()
      } else {
        this.open()
      }
    },

    open() {
      this.openState = true
    },

    onClick(item) {
      if (!item.doNotClose) {
        this.close()
      }
    },

    close() {
      this.openState = false
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
