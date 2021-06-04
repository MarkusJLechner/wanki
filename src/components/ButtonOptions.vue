<template>
  <ButtonIcon icon="fas fa-ellipsis-v" @click="openMenu">
    <template #content>
      <transition name="slide-open">
        <div
          v-if="menu"
          class="
            bg-gray-700
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
import ButtonIcon from './ButtonIcon.vue'
import List from './List.vue'
export default {
  components: { ButtonIcon, List },

  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      menu: false,
    }
  },

  methods: {
    openMenu() {
      this.menu = !this.menu
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
