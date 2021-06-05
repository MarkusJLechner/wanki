<template>
  <transition name="fade" appear>
    <div
      v-if="menu"
      class="fixed z-100 inset-0 bg-black bg-opacity-20 transition-opacity"
      aria-hidden="true"
      @mousedown.stop="closeMenu()"
      @touchstart.stop="closeMenu()"
    ></div>
  </transition>
  <ButtonIcon icon="fas fa-ellipsis-v" @click="openMenu">
    <template #content>
      <transition name="slide-open">
        <div
          v-if="menu"
          class="
            dark:bg-gray-700
            bg-gray-200
            z-200
            rounded-md
            shadow-xl
            w-[15rem]
            pointer-event-none
            top-0
            right-0
            absolute
          "
        >
          <List dense no-separation :value="value" @item="onClickItem" />
        </div>
      </transition>
    </template>
  </ButtonIcon>
</template>

<script>
import ButtonIcon from 'components/ButtonIcon.vue'
import { defineAsyncComponent } from 'vue'

const List = defineAsyncComponent(() => import('components/List.vue'))

export default {
  components: { ButtonIcon, List },

  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },

  emits: ['item'],

  data() {
    return {
      menu: false,
    }
  },

  methods: {
    openMenu() {
      this.menu = !this.menu
    },

    closeMenu() {
      this.menu = false
    },

    onClickItem(item) {
      if (item.emit) {
        this.$emit(item.emit)
      }
      this.$emit('item', item)
    },
  },
}
</script>
