<template>
  <div>
    <transition name="fade" appear>
      <div
        v-if="show"
        class="fixed inset-0 z-20 bg-gray-900/50 backdrop-grayscale transition-opacity"
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
            class="pointer-event-none absolute top-0 right-1 z-20 w-60 rounded-md bg-gray-200 shadow-xl dark:bg-gray-700"
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

import type { ListItem } from '@/components/List'

interface Item extends ListItem {
  emit?: string
  value?: string | number | boolean | object | null | undefined
}

interface Props {
  value?: Item[]
}

// We need to define props even if not directly referenced
withDefaults(defineProps<Props>(), {
  value: () => [],
})

const emit = defineEmits<{
  item: [item: Item]
  // Using more specific types for dynamic emits
  [key: string]: [item: Item]
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

const onClickItem = (item: ListItem): void => {
  // Cast to Item type to access the emit property
  const itemAsItem = item as Item
  if (itemAsItem.emit) {
    emit(itemAsItem.emit, itemAsItem)
  }
  emit('item', itemAsItem)
}
</script>
