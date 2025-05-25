<template>
  <ListLi
    :no-gutters="noGutters"
    :dense="dense"
    :no-separation="noSeparation"
    :item-text-key="itemTextKey"
    :no-ripple="root || (!root && isOpen)"
    :render="!root"
    :item="item"
    :style="!!(level - 1) ? `padding-left: ${level * 20}px !important;` : ''"
    :class="{
      [$attrs.class]: !!$attrs.class,
      'bg-gray-700': level > 1,
    }"
    @item="$emit('item', $event)"
    @long-press="$emit('long-press', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData"
      ><slot :name="name" v-bind="slotData"
    /></template>
    <template v-if="!root" #before>
      <ButtonIcon
        v-if="isFolder"
        :icon="isOpen ? 'fas fa-angle-down' : 'fas fa-angle-right'"
        class="z-10 -mt-1 -mb-3 -ml-3 h-10 w-10"
        @touchstart.stop
        @mousedown.stop
        @click.stop="toggle"
      />
    </template>
  </ListLi>

  <transition name="slide-right">
    <ul v-show="isOpen" v-if="isFolder" class="relative pt-0">
      <ListTreeItem
        v-for="(child, index) in item.children"
        :key="index"
        :no-gutters="noGutters"
        :dense="dense"
        :level="level + 1"
        :no-separation="index >= item.children.length - 1"
        :item="child"
        :item-text-key="itemTextKey"
        @item="$emit('item', $event)"
        @long-press="$emit('long-press', $event)"
      >
        <template v-for="(_, name) in $slots" #[name]="slotData"
          ><slot :name="name" v-bind="slotData"
        /></template>
      </ListTreeItem>
      <ListHr />
    </ul>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ListLi from '@/components/ListLi.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import ListHr from '@/components/ListHr.vue'

interface Props {
  item: Record<string, any>
  itemTextKey?: string
  level?: number
  noGutters?: boolean
  dense?: boolean
  noSeparation?: boolean
  root?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemTextKey: 'text',
  level: 0,
  noGutters: false,
  dense: false,
  noSeparation: false,
  root: false,
})

defineEmits<{
  item: [item: Record<string, any>]
  'long-press': [item: Record<string, any>]
}>()

const isOpen = ref(props.root)

const isFolder = computed((): boolean => {
  return !!props.item?.children && !!props.item.children?.length
})

function toggle(): void {
  if (isFolder.value) {
    isOpen.value = !isOpen.value
  }
}
</script>

<style scoped>
.slide-left,
.slide-right {
  transition-timing-function: ease-out;
}

.slide-left {
  z-index: 200;
}

.slide-right {
  z-index: 300;
}

.slide-left-enter-to,
.slide-left-leave-to,
.slide-right-enter-to,
.slide-right-leave-to {
  transition-duration: 0.2s;
  transition-property: height, opacity, transform;
  overflow: hidden;
}

.slide-left-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translate(2em, 0);
}

.slide-left-leave-to,
.slide-right-enter-from {
  opacity: 0;
  transform: translate(-2em, 0);
}
</style>
