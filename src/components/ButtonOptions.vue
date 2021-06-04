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
          <List dense no-separation :value="listItems" />
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

  data() {
    return {
      menu: false,
      listItems: [
        { text: 'Create filtered deck' },
        { text: 'Check database' },
        { text: 'Check media' },
        { text: 'Empty cards' },
        { text: 'Restore from backup' },
        { text: 'Manage note types' },
        { text: 'Import' },
        { text: 'Export collection' },
      ],
    }
  },

  methods: {
    openMenu() {
      this.menu = !this.menu
    },
  },
}
</script>

<style scoped>
.slide-open {
  position: fixed;
  top: 0;
  transform: translate(0, 0) rotateX(0deg);
}

.slide-open-enter-active,
.slide-open-leave-active {
  transition: 0.2s;
}

.slide-open-enter-from {
  opacity: 0;
  transform: translate(0, -100px) perspective(700px) rotateX(45deg);
}

.slide-open-leave-to {
  opacity: 0;
  transform: translate(0, 10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
