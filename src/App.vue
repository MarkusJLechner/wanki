<template>
  <main class="dark:bg-gray-600 bg-gray-200 dark:text-white h-screen text-lg">
    <router-view v-slot="{ Component, route }">
      <transition appear :name="route.meta.transition || transitionName">
        <component
          :is="Component"
          class="flex flex-col dark:bg-gray-600 h-screen bg-gray-200"
        />
      </transition>
    </router-view>
  </main>
</template>

<script>
import { watch } from 'vue'
import { refstorage } from './store/globalstate'

export default {
  data() {
    return {
      transitionName: 'fade',
    }
  },
  mounted() {
    refstorage.get('darkTheme', true)

    let htmlClasses = document.querySelector('html').classList
    watch(refstorage.ref('darkTheme'), (value) => {
      if (value) {
        htmlClasses.add('dark')
      } else {
        htmlClasses.remove('dark')
      }
    })

    if (refstorage.get('darkTheme', true)) {
      document.querySelector('html').classList.add('dark')
    } else {
      document.querySelector('html').classList.remove('dark')
    }
  },

  created() {
    this.$router.beforeEach((to, from, next) => {
      let transitionName = to.meta.transitionName || from.meta.transitionName

      //if (transitionName === 'slide') {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      if (toDepth !== fromDepth) {
        transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
      }
      //}

      this.transitionName = transitionName || 'fade'

      console.log(this.transitionName)

      next()
    })
  },

  methods: {
    beforeLeave(element) {
      this.prevHeight = getComputedStyle(element).height
    },
    enter(element) {
      const { height } = getComputedStyle(element)

      element.style.height = this.prevHeight

      setTimeout(() => {
        element.style.height = height
      })
    },
    afterEnter(element) {
      element.style.height = 'auto'
    },
  },
}
</script>

<style scoped>
html,
body {
  width: 100%;
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2s;
  transition-property: height, opacity;
  transition-timing-function: ease;
  overflow: hidden;
  position: fixed;
  min-width: 100vw;
  min-height: 100vh;
}

.fade-enter-from,
.fade-leave-active {
  opacity: 0;
}

.slide-left,
.slide-right {
  transition-timing-function: ease-out;
}

.slide-left {
  z-index: 200;
}

.slide-right {
  z-index: 300;
}

.slide-left-enter-to,
.slide-left-leave-to,
.slide-right-enter-to,
.slide-right-leave-to {
  transition-duration: 0.2s;
  transition-property: height, opacity, transform;
  overflow: hidden;
  position: fixed;
  min-width: 100vw;
  min-height: 100vh;
}

.slide-left-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translate(2em, 0);
}

.slide-left-leave-to,
.slide-right-enter-from {
  opacity: 0;
  transform: translate(-2em, 0);
}
</style>
