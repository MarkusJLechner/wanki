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

<script>
import List from 'components/List.vue'

export default {
  components: { List },
  props: {
    items: {
      type: Array,
      default: () => [],
    },

    value: {
      type: String,
      default: null,
    },
  },

  watch: {
    value() {
      this.initValue()
    },
  },

  mounted() {
    this.initValue()
  },

  methods: {
    initValue() {
      const selected = this.items.findIndex((item) => item.value === this.value)
      this.$emit(
        'update:items',
        this.items.map((item, index) => {
          item.selected = index === selected
          return item
        }),
      )
    },

    onClick(item) {
      const selected = this.items.indexOf(item)
      this.$emit(
        'update:items',
        this.items.map((item, index) => {
          item.selected = index === selected
          return item
        }),
      )
    },
  },
}
</script>
