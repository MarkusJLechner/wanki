<template>
  <div class="refresher z-50">
    <div class="loading-bar"></div>
    <div class="loading-bar"></div>
    <div class="loading-bar"></div>
    <div class="loading-bar"></div>
  </div>

  <div id="main-content" class="flex-grow overflow-y-auto">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'MainContent',

  props: {
    pullToRefresh: {
      type: Function,
      default: () => {},
    },
  },

  mounted() {
    if (this.pullToRefresh) {
      console.log('init me')
      this.initPullToRefresh()
    }
  },

  methods: {
    initPullToRefresh() {
      let _startY
      let okPull = false

      const container = document.querySelector('#main-content')
      container.addEventListener(
        'touchstart',
        (e) => {
          _startY = e.touches[0].pageY
          okPull = container.scrollTop === 0
        },
        { passive: true },
      )

      container.addEventListener(
        'touchmove',
        (e) => {
          if (!okPull) {
            return
          }

          const y = e.touches[0].pageY
          // Activate custom pull-to-refresh effects when at the top of the container
          // and user is scrolling up.
          if (
            document.scrollingElement.scrollTop === 0 &&
            y > _startY &&
            !document.body.classList.contains('refreshing')
          ) {
            console.log('refresh')
            this.simulateRefreshAction()
            this.pullToRefresh()
          }
        },
        { passive: true },
      )
    },

    async simulateRefreshAction() {
      const sleep = (timeout) =>
        new Promise((resolve) => setTimeout(resolve, timeout))

      const transitionEnd = function (propertyName, node) {
        return new Promise((resolve) => {
          function callback(e) {
            e.stopPropagation()
            if (e.propertyName === propertyName) {
              node.removeEventListener('transitionend', callback)
              resolve(e)
            }
          }
          node.addEventListener('transitionend', callback)
        })
      }

      const refresher = document.querySelector('.refresher')

      document.body.classList.add('refreshing')
      await sleep(2000)

      refresher.classList.add('shrink')
      await transitionEnd('transform', refresher)
      refresher.classList.add('done')

      refresher.classList.remove('shrink')
      document.body.classList.remove('refreshing')
      await sleep(0) // let new styles settle.
      refresher.classList.remove('done')
    },
  },
}
</script>

<style scoped>
body.refreshing #main-content,
body.refreshing header {
  filter: blur(1px);
  touch-action: none; /* prevent scrolling */
}
body.refreshing .refresher {
  transform: translate3d(0, 150%, 0) scale(1);
  z-index: 1;
  visibility: visible;
}
.refresher {
  pointer-events: none;
  --refresh-width: 55px;
  background: #fff;
  width: var(--refresh-width);
  height: var(--refresh-width);
  border-radius: 50%;
  position: absolute;
  left: calc(50% - var(--refresh-width) / 2);
  padding: 8px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
  will-change: transform, opacity;
  display: inline-flex;
  justify-content: space-evenly;
  align-items: center;
  visibility: hidden;
}
body.refreshing .refresher.shrink {
  transform: translate3d(0, 150%, 0) scale(0);
  opacity: 0;
}
.refresher.done {
  transition: none;
}
.loading-bar {
  width: 4px;
  height: 18px;
  border-radius: 4px;
  animation: loading 1s ease-in-out infinite;
}
.loading-bar:nth-child(1) {
  background-color: #3498db;
  animation-delay: 0;
}
.loading-bar:nth-child(2) {
  background-color: #c0392b;
  animation-delay: 0.09s;
}
.loading-bar:nth-child(3) {
  background-color: #f1c40f;
  animation-delay: 0.18s;
}
.loading-bar:nth-child(4) {
  background-color: #27ae60;
  animation-delay: 0.27s;
}
@keyframes loading {
  0% {
    transform: scale(1);
  }
  20% {
    transform: scale(1, 2.2);
  }
  40% {
    transform: scale(1);
  }
}
</style>
