<template>
  <div :class="classesRoot">
    <div
      v-if="show"
      class="fixed top-0 left-0 h-full w-screen bg-gray-900/50 backdrop-grayscale"
      @click="onClose()"
    />
    <transition name="fade">
      <ul v-if="show" :class="listClass">
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
import { ref, computed } from 'vue'
import ButtonRound from '@/components/ButtonRound.vue'
import { onBeforeRouteLeave } from 'vue-router'

interface ButtonItem {
  text: string
  icon: string
  href?: string
  value?: string
}

const emit = defineEmits<{
  item: [item: ButtonItem]
}>()

const props = withDefaults(
  defineProps<{
    modelValue: ButtonItem[]
    left?: boolean
  }>(),
  { left: false },
)

const classesRoot = computed(() =>
  props.left
    ? 'fixed left-2 bottom-4 z-10 text-left'
    : 'fixed right-2 bottom-4 z-10 text-right',
)

const listClass = computed(() =>
  props.left ? 'relative ml-2 -mb-1' : 'relative mr-2 -mb-1',
)

const show = ref(false)

const onClick = () => {
  if (show.value) {
    onClose()
  } else {
    show.value = true
  }
}

const onClickItem = (item: ButtonItem) => {
  emit('item', item)
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
