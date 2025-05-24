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

<script setup lang="ts">
import ListTreeItem from '@/components/ListTreeItem.vue'

interface Props {
  modelValue: Record<string, any>;
  itemTextKey?: string;
  noGutters?: boolean;
  dense?: boolean;
  noSeparation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  itemTextKey: 'text',
  noGutters: false,
  dense: false,
  noSeparation: false
})

defineEmits<{
  (e: 'item', item: Record<string, any>): void;
  (e: 'long-press', item: Record<string, any>): void;
}>()
</script>

<style scoped></style>
