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
      ' bg-gray-700 ': level > 1,
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
        class="w-10 h-10 -ml-3 -mt-1 -mb-3 z-10"
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

<script>
import ListLi from '@/components/ListLi.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import ListHr from '@/components/ListHr.vue'
export default {
  name: 'ListTreeItem',
  components: { ListHr, ButtonIcon, ListLi },
  props: {
    item: {
      type: Object,
      required: true,
    },

    itemTextKey: {
      type: String,
      default: 'text',
    },

    level: {
      type: Number,
      default: 0,
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

    root: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['item', 'long-press'],

  data() {
    return {
      isOpen: this.root,
    }
  },

  computed: {
    isFolder() {
      return !!this.item?.children && !!this.item.children?.length
    },
  },

  methods: {
    toggle() {
      if (this.isFolder) {
        this.isOpen = !this.isOpen
      }
    },
  },
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
