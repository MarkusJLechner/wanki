<template>
  <div class="fixed right-2 bottom-4 z-10 text-right">
    <div
      v-if="show"
      class="fixed top-0 left-0 h-full w-screen bg-gray-900/50 backdrop-grayscale"
      @click="onClose()"
    />
    <transition name="fade">
      <ul v-if="show" class="relative mr-2 -mb-1">
        <li
          v-for="(item, index) in modelValue"
          :key="index"
          @click="onClickItem(item)"
        >
          <Component
            :is="item.href ? 'a' : 'div'"
            class="block"
            target="_blank"
            :href="item.href"
          >
            <span
              class="z-20 rounded-sm bg-gray-800 px-2 py-1 text-white select-none"
              >{{ item.text }}</span
            ><ButtonRound small :icon="item.icon" />
          </Component>
        </li>
      </ul>
    </transition>
    <ButtonRound
      class="duration-100"
      :class="{
        'rotate-45': show,
        border: !show,
      }"
      @click="onClick"
      data-test="floating-button"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ButtonRound from '@/components/ButtonRound.vue'
import { onBeforeRouteLeave } from 'vue-router'

interface ButtonItem {
  text: string
  icon: string
  href?: string
}

defineProps<{
  modelValue: ButtonItem[]
}>()

const show = ref(false)

const onClick = () => {
  if (show.value) {
    onClose()
  } else {
    show.value = true
  }
}

// Parameter is required for type safety but not used in the function body
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onClickItem = (_item: ButtonItem) => {
  onClose()
}

const onClose = () => {
  show.value = false
}

onBeforeRouteLeave(() => {
  if (show.value) {
    onClose()
    return false
  }

  return true
})
</script>

<style scoped>
.fade-enter-active li,
.fade-leave-active li {
  transition:
    transform 0.15s,
    opacity 0.15s ease;
}

.fade-enter-from li {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-to li {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-from li {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-to li {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
