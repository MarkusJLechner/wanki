<template>
  <div class="z-10 fixed right-2 bottom-4 text-right">
    <div
      v-if="show"
      class="
        fixed
        w-screen
        h-full
        left-0
        top-0
        bg-gray-900 bg-opacity-50
        backdrop-grayscale backdrop-filter
      "
      @click="onClose()"
    />
    <transition name="fade">
      <ul v-if="show" class="relative mr-2 -mb-1">
        <li
          v-for="(item, index) in modelValue"
          :key="index"
          @click="onClickItem(item)"
        >
          <Component
            :is="item.href ? 'a' : 'div'"
            class="block"
            target="_blank"
            :href="item.href"
          >
            <span
              class="bg-gray-800 py-1 px-2 z-20 rounded text-white select-none"
              >{{ item.text }}</span
            ><ButtonRound small :icon="item.icon" />
          </Component>
        </li>
      </ul>
    </transition>
    <ButtonRound
      class="transform duration-100"
      :class="{
        'rotate-45': show,
        border: !show,
      }"
      @click="onClick"
    />
  </div>
</template>

<script>
import ButtonRound from '@/components/ButtonRound.vue'
import { onBeforeRouteLeave } from 'vue-router'
export default {
  name: 'ButtonFloating',
  components: { ButtonRound },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      show: false,
    }
  },

  mounted() {
    onBeforeRouteLeave(() => {
      if (this.show) {
        this.onClose()
        return false
      }

      return true
    })
  },

  methods: {
    onClick() {
      if (this.show) {
        this.onClose()
      } else {
        this.show = true
      }
    },

    onClickItem(item) {
      this.onClose()
    },

    onClose() {
      this.show = false
    },
  },
}
</script>

<style scoped>
.fade-enter-active li,
.fade-leave-active li {
  transition: transform 0.15s, opacity 0.15s ease;
}

.fade-enter-from li {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-to li {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-from li {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-to li {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
