<template>
  <main class="h-full dark:bg-gray-600 bg-gray-200 dark:text-white text-lg">
    <Toasts />
    <router-view v-slot="{ Component, route }">
      <transition appear :name="route.meta.transition || transitionName">
        <keep-alive include="Overview">
          <component
            :is="Component"
            class="h-full flex flex-col dark:bg-gray-600 bg-gray-200"
          />
        </keep-alive>
      </transition>
    </router-view>
    <background-task />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watch } from 'vue'
import { useRouter, RouteLocationNormalized } from 'vue-router'
import { clearToasts, refstorage } from '@/store/globalstate'
import { persist } from '@/plugins/idb.js'
import { wankidb } from '@/plugins/wankidb/db.js'
import BackgroundTask from '@/components/BackgroundTask.vue'
import Toasts from '@/components/Toasts.vue'

const router = useRouter()
const transitionName = ref('fade')
let prevHeight = ref('')

// Initialize storage
const initStorage = async () => {
  await persist()
}

// Transition methods
const beforeLeave = (element: HTMLElement) => {
  prevHeight.value = getComputedStyle(element).height
}

const enter = (element: HTMLElement) => {
  const { height } = getComputedStyle(element)

  element.style.height = prevHeight.value

  setTimeout(() => {
    element.style.height = height
  })
}

const afterEnter = (element: HTMLElement) => {
  element.style.height = 'auto'
}

// Setup router navigation guards
onBeforeMount(() => {
  router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
    let newTransitionName = to.meta.transitionName as string || from.meta.transitionName as string

    const toDepth = to.path.split('/').length
    const fromDepth = from.path.split('/').length
    if (toDepth !== fromDepth) {
      newTransitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    }

    transitionName.value = newTransitionName || 'fade'

    clearToasts()

    next()
  })
})

// Setup on component mount
onMounted(() => {
  initStorage()
  // @ts-ignore - Adding wankidb to window
  window.wankidb = wankidb

  const htmlClasses = document.querySelector('html')?.classList
  if (htmlClasses) {
    watch(refstorage.ref('darkTheme'), (value) => {
      if (value) {
        htmlClasses.add('dark')
      } else {
        htmlClasses.remove('dark')
      }
    })

    if (refstorage.get('darkTheme', true)) {
      htmlClasses.add('dark')
    } else {
      htmlClasses.remove('dark')
    }
  }
})
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
