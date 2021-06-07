<template>
  <div>
    <transition name="fade" appear>
      <div
        v-if="menu"
        class="fixed z-10 inset-0 bg-black bg-opacity-20 transition-opacity"
        aria-hidden="true"
        @mousedown.stop.prevent="closeMenu()"
        @touchstart.stop.prevent="closeMenu()"
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
              z-20
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
  </div>
</template>

<script>
import ButtonIcon from 'components/ButtonIcon.vue'
import List from 'components/List.vue'

export default {
  components: { List, ButtonIcon },

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
