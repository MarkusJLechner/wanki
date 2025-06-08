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
import type { ItemButtonOption } from 'components/ButtonOptions.ts'

interface Props {
  value?: Item[]
}

// We need to define props even if not directly referenced
withDefaults(defineProps<Props>(), {
  value: () => [],
})

const emit = defineEmits<{
  item: [item: ItemButtonOption]
  // Using more specific types for dynamic emits
  [key: string]: [item: ItemButtonOption]
}>()

const show = ref(false)

onMounted(() => {
  // router.push will not work in dispatch when modal cloases
  // Error guard afterEach - Navigation aborted from ... via a navigation guard.
  onBeforeRouteLeave(() => {
    if (show.value) {
      onClose()
      // prevent back fix https://github.com/MarkusJLechner/wanki/commit/a907db731e5821ddb7e67d49a3af47c7d4a8c544
      // why was this needed?
      return true
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
  const itemAsItem = item as ItemButtonOption
  if (itemAsItem.emit) {
    emit(itemAsItem.emit, itemAsItem)
  }
  emit('item', itemAsItem)
}
</script>
