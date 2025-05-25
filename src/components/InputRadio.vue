<template>
  <List :value="items" @item="onClick">
    <template #prefix-item="{ item }">
      <div
        class="
          relative
          bg-white
          dark:bg-gray-700
          w-6
          h-6
          rounded-full
          dark:border-white
          border-2
          mr-3
        "
        :class="{
          'border-blue-500 dark:border-blue-500 p-1': item.selected,
          'border-gray-500': !item.selected,
        }"
      >
        <div
          v-if="item.selected"
          class="absolute w-3 h-3 bg-blue-500 rounded-full"
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
  [key: string]: any
}

interface Props {
  items: Item[]
  value?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  value: null
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

watch(() => props.value, () => {
  initValue()
})

onMounted(() => {
  initValue()
})
</script>
