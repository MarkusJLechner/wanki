<template>
  <List :value="items" @item="onClick">
    <template #prefix-item="{ item }">
      <div
        class="relative mr-3 h-6 w-6 rounded-full border-2 bg-white dark:border-white dark:bg-gray-700"
        :class="{
          'border-blue-500 p-1 dark:border-blue-500': item.selected,
          'border-gray-500': !item.selected,
        }"
      >
        <div
          v-if="item.selected"
          class="absolute h-3 w-3 rounded-full bg-blue-500"
        ></div>
      </div>
    </template>
  </List>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import List from '@/components/List.vue'

interface Item {
  value: string
  selected?: boolean
  [key: string]: unknown
}

interface Props {
  items: Item[]
  value?: string | null
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

const onClick = (item: Item) => {
  const selected = props.items.indexOf(item)
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
