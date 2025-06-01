<template>
  <List :value="items" @item="onClick">
    <template #prefix-item="{ item }">
      <div
        class="relative mr-3 h-6 w-6 rounded-full border-2 bg-white dark:border-white dark:bg-gray-700"
        :class="{
          'border-blue-500 p-1 dark:border-blue-500': (item as Item).selected,
          'border-gray-500': !(item as Item).selected,
        }"
      >
        <div
          v-if="(item as Item).selected"
          class="absolute h-3 w-3 rounded-full bg-blue-500"
        ></div>
      </div>
    </template>
  </List>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import List from '@/components/List.vue'

import type { ListItem } from '@/components/List'

interface Item extends ListItem {
  value: string | number
  selected?: boolean
}

interface Props {
  items: Item[]
  value?: string | number | null
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  value: null,
})

const emit = defineEmits<{
  'update:items': [items: Item[]]
}>()

const initValue = () => {
  const selected = props.items.findIndex((item) => item.value === props.value)
  emit(
    'update:items',
    props.items.map((item, index) => {
      item.selected = index === selected
      return item
    }),
  )
}

const onClick = (item: ListItem) => {
  // Cast to Item type to access required properties
  const itemAsItem = item as Item
  const selected = props.items.indexOf(itemAsItem)
  emit(
    'update:items',
    props.items.map((item, index) => {
      item.selected = index === selected
      return item
    }),
  )
}

watch(
  () => props.value,
  () => {
    initValue()
  },
)

onMounted(() => {
  initValue()
})
</script>
