<template>
  <div>
    <transition name="fade" appear>
      <div
        v-if="show"
        class="
          fixed
          z-20
          inset-0
          bg-gray-900/50
          backdrop-grayscale
          transition-opacity
        "
        aria-hidden="true"
        @mousedown.stop.prevent="onClose()"
        @touchstart.stop.prevent="onClose()"
      ></div>
    </transition>
    <ButtonIcon icon="fas fa-ellipsis-v" @click="onOpen">
      <template #content>
        <transition name="slide-open">
          <div
            v-if="show"
            class="
              dark:bg-gray-700
              bg-gray-200
              z-20
              rounded-md
              shadow-xl
              w-60
              pointer-event-none
              top-0
              right-1
              absolute
            "
          >
            <List dense no-separation :value="value" @item="onClickItem" />
          </div>
        </transition>
      </template>
    </ButtonIcon>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import List from '@/components/List.vue'
import { onBeforeRouteLeave } from 'vue-router'

interface Item {
  text?: string
  value?: any
  emit?: string
  [key: string]: any
}

interface Props {
  value?: Item[]
}

const props = withDefaults(defineProps<Props>(), {
  value: () => []
})

const emit = defineEmits<{
  (e: 'item', item: Item): void
  [key: string]: (...args: any[]) => void
}>()

const show = ref(false)

onMounted(() => {
  onBeforeRouteLeave(() => {
    if (show.value) {
      onClose()
      return false
    }

    return true
  })
})

const onOpen = (): void => {
  if (show.value) {
    onClose()
  } else {
    show.value = true
  }
}

const onClose = (): void => {
  show.value = false
}

const onClickItem = (item: Item): void => {
  if (item.emit) {
    emit(item.emit as any, item)
  }
  emit('item', item)
}
</script>
