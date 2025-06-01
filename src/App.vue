<template>
  <main class="h-full bg-gray-200 text-lg dark:bg-gray-600 dark:text-white">
    <Toasts />
    <router-view v-slot="{ Component, route }">
      <transition
        appear
        :name="(route.meta.transition as string | undefined) || transitionName"
      >
        <keep-alive include="Overview">
          <component
            :is="Component"
            class="flex h-full flex-col bg-gray-200 dark:bg-gray-600"
          />
        </keep-alive>
      </transition>
    </router-view>
    <background-task />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { clearToasts, refstorage } from '@/store/globalstate'
import { persist } from '@/plugins/idb'
import { wankidb } from '@/plugins/wankidb/db'
import BackgroundTask from '@/components/BackgroundTask.vue'
import Toasts from '@/components/Toasts.vue'
import { defaultSettings } from 'plugins/defaultSettings.ts'

const router = useRouter()
const transitionName = ref('fade')
const prevHeight = ref('')

// Initialize storage
const initStorage = async () => {
  await persist()
}

// Transition methods - currently not used but kept for future implementation
// These methods will be used when implementing custom transitions
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
  router.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
      let newTransitionName =
        (to.meta.transitionName as string) ||
        (from.meta.transitionName as string)

      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      if (toDepth !== fromDepth) {
        newTransitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
      }

      transitionName.value = newTransitionName || 'fade'

      clearToasts()

      next()
    },
  )
})

// Setup on component mount
onMounted(() => {
  void initStorage()
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

    if (refstorage.get('darkTheme', defaultSettings.darkTheme)) {
      htmlClasses.add('dark')
    } else {
      htmlClasses.remove('dark')
    }
  }
})

defineExpose({ afterEnter, enter, beforeLeave })
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
