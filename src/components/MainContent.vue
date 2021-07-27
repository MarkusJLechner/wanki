<template>
  <div class="flex-grow flex overflow-y-auto w-full">
    <div
      class="
        pulldown-element
        rounded-full
        p-2
        bg-white
        mt-3
        shadow-lg
        pointer-events-none
        absolute
        inline-flex
        justify-center
        items-center
        z-10
      "
    >
      <LoadingLogo />
    </div>

    <div class="refresh-content flex flex-col flex-grow relative">
      <slot />
    </div>
  </div>
</template>

<script>
import LoadingLogo from '@/components/LoadingLogo.vue'
import { modalOpened } from '@/store/globalstate.js'
import { isMobile, sleep } from '@/plugins/global.js'
export default {
  name: 'MainContent',
  components: { LoadingLogo },
  props: {
    pullToRefresh: {
      type: Function,
      default: null,
    },
  },

  mounted() {
    if (this.pullToRefresh) {
      this.initPullToRefresh()
    }
  },

  methods: {
    initPullToRefresh() {
      let _startY
      let okPull = false

      const container = document.querySelector('.refresh-content')

      const onStart = (e) => {
        _startY = e.clientY || (e.touches && e.touches[0].clientY)
        okPull = container.parentElement.scrollTop === 0
      }

      const onMove = (e) => {
        if (!okPull) {
          return
        }

        const pullOverY = 84
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - pullOverY
        if (
          okPull &&
          !modalOpened.value &&
          document.scrollingElement.scrollTop === 0 &&
          y > _startY &&
          !document.body.classList.contains('refreshing')
        ) {
          this.callPullToRefresh()
          okPull = false
        }
      }

      const onEnd = () => {
        okPull = false
      }

      if (isMobile) {
        container.addEventListener('touchstart', onStart, { passive: true })
        container.addEventListener('touchmove', onMove, { passive: true })
      } else {
        container.addEventListener('mousedown', onStart, { passive: true })
        container.addEventListener('mousemove', onMove, { passive: true })
        container.addEventListener('mouseup', onEnd, { passive: true })
      }
    },

    async callPullToRefresh() {
      const pulldownElement = document.querySelector('.pulldown-element')
      const refreshContent = document.querySelector('.refresh-content')
      refreshContent.classList.add('refresh-active')
      pulldownElement.classList.add('visible')
      let pullElementAnimation = pulldownElement.animate(
        [
          { transform: 'translate3d(0, -6rem, 0) scaleX(-0.5) scaleY(0)' },
          { transform: 'translate3d(0, 0, 0) scaleX(1) scaleY(1)' },
        ],
        {
          duration: 120,
          iterations: 1,
        },
      )

      // run task
      await this.pullToRefresh()
      await sleep(300)

      await pullElementAnimation.finished

      pullElementAnimation = pulldownElement.animate(
        [
          { transform: 'translate3d(0, 0, 0) scaleX(1) scaleY(1)' },
          { transform: 'translate3d(0, 0, 0) scaleX(0) scaleY(0)' },
        ],
        {
          duration: 100,
          iterations: 1,
        },
      )

      await pullElementAnimation.finished
      refreshContent.classList.remove('refresh-active')
      pulldownElement.classList.remove('visible')
    },
  },
}
</script>

<style scoped>
.refresh-content.refresh-active {
  filter: blur(2px);
  touch-action: none;
  pointer-events: none;
}

.visible {
  visibility: inherit !important;
}

.pulldown-element {
  --width: 55px;

  width: var(--width);
  height: var(--width);
  left: calc(50% - var(--width) / 2);
  will-change: transform, opacity;
  visibility: hidden;
}
</style>
