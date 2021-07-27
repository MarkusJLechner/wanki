<template>
  <ul>
    <ListTreeItem
      root
      :no-gutters="noGutters"
      :dense="dense"
      class="py-0"
      :level="0"
      :no-separation="noSeparation"
      :item-text-key="itemTextKey"
      :item="modelValue"
      @item="$emit('item', $event)"
      @long-press="$emit('long-press', $event)"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData"
        ><slot :name="name" v-bind="slotData"
      /></template>
    </ListTreeItem>
  </ul>
</template>

<script>
import List from '@/components/List.vue'
import ListTreeItem from '@/components/ListTreeItem.vue'

export default {
  name: 'ListTree',

  components: { ListTreeItem },

  props: {
    modelValue: {
      type: Object,
      default: () => {},
    },

    itemTextKey: {
      type: String,
      default: 'text',
    },

    noGutters: {
      type: Boolean,
      default: false,
    },

    dense: {
      type: Boolean,
      default: false,
    },

    noSeparation: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['item', 'long-press'],
}
</script>

<style scoped></style>
