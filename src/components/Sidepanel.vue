<template>
  <ButtonIcon class="toggle-button" icon="fas fa-bars" @click="toggle()" />

  <transition name="fade">
    <div
      v-if="openState"
      class="bg-black opacity-50 fixed w-full h-screen top-0 left-0"
      @mousedown.stop="close()"
      @touchstart.stop="close()"
    ></div>
  </transition>
  <nav
    ref="slide"
    :class="{ open: openState }"
    class="
      slide-parent
      fixed
      left-0
      top-0
      flex flex-col
      bg-white
      dark:bg-gray-700
      h-full
      w-64
      shadow-md
      z-20
    "
  >
    <slot name="slide-content">
      <List no-separation no-gutters :value="items" @item="onClick" />
    </slot>
  </nav>
</template>

<script>
import ButtonIcon from 'components/ButtonIcon.vue'
import List from 'components/List.vue'

export default {
  components: {
    List,
    ButtonIcon,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      openState: false,
    }
  },

  methods: {
    toggle() {
      if (this.openState) {
        this.close()
      } else {
        this.open()
      }
    },

    open() {
      this.openState = true
    },

    onClick(item) {
      if (!item.doNotClose) {
        this.close()
      }
    },

    close() {
      this.openState = false
    },
  },
}
</script>

<style scoped>
.slide-parent {
  transition: 0.2s transform ease-in-out;
  transform: translateX(-100%);
}

.slide-parent.open {
  transform: translateX(0%);
}
</style>
