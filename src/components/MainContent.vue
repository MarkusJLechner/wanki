<template>
  <div class="flex w-full grow overflow-y-auto">
    <div
      class="pulldown-element pointer-events-none absolute z-10 mt-3 inline-flex items-center justify-center rounded-full bg-white p-2 shadow-lg"
    >
      <LoadingLogo />
    </div>

    <div class="refresh-content relative flex grow flex-col">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import LoadingLogo from '@/components/LoadingLogo.vue'
import { modalOpened } from '@/store/globalstate'
import { isMobile, sleep } from '@/plugins/global'

interface Props {
  pullToRefresh?: (() => Promise<void>) | null
}

const props = withDefaults(defineProps<Props>(), {
  pullToRefresh: null,
})

onMounted(() => {
  if (props.pullToRefresh) {
    initPullToRefresh()
  }
})

function initPullToRefresh() {
  let _startY: number
  let okPull = false

  const container = document.querySelector('.refresh-content')

  const onStart = (e: MouseEvent | TouchEvent) => {
    _startY =
      (e as MouseEvent).clientY ||
      ((e as TouchEvent).touches && (e as TouchEvent).touches[0].clientY)
    okPull = container!.parentElement!.scrollTop === 0
  }

  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!okPull) {
      return
    }

    const pullOverY = 84
    const y =
      ((e as MouseEvent).clientY ||
        ((e as TouchEvent).touches && (e as TouchEvent).touches[0].clientY)) -
      pullOverY
    if (
      okPull &&
      !modalOpened.value &&
      document.scrollingElement!.scrollTop === 0 &&
      y > _startY &&
      !document.body.classList.contains('refreshing')
    ) {
      callPullToRefresh()
      okPull = false
    }
  }

  const onEnd = () => {
    okPull = false
  }

  if (isMobile) {
    container!.addEventListener('touchstart', onStart, { passive: true })
    container!.addEventListener('touchmove', onMove, { passive: true })
  } else {
    container!.addEventListener('mousedown', onStart, { passive: true })
    container!.addEventListener('mousemove', onMove, { passive: true })
    container!.addEventListener('mouseup', onEnd, { passive: true })
  }
}

async function callPullToRefresh() {
  const pulldownElement = document.querySelector('.pulldown-element')
  const refreshContent = document.querySelector('.refresh-content')
  refreshContent!.classList.add('refresh-active')
  pulldownElement!.classList.add('visible')
  let pullElementAnimation = pulldownElement!.animate(
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
  if (props.pullToRefresh) {
    await props.pullToRefresh()
  }
  await sleep(300)

  await pullElementAnimation.finished

  pullElementAnimation = pulldownElement!.animate(
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
  refreshContent!.classList.remove('refresh-active')
  pulldownElement!.classList.remove('visible')
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
