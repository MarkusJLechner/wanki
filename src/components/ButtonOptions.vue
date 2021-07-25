<template>
  <div>
    <transition name="fade" appear>
      <div
        v-if="show"
        class="
          fixed
          z-20
          inset-0
          bg-gray-900 bg-opacity-50
          backdrop-grayscale backdrop-filter
          transition-opacity
        "
        aria-hidden="true"
        @mousedown.stop.prevent="onClose()"
        @touchstart.stop.prevent="onClose()"
      ></div>
    </transition>
    <ButtonIcon icon="fas fa-ellipsis-v" @click="onOpen">
      <template #content>
        <transition name="slide-open">
          <div
            v-if="show"
            class="
              dark:bg-gray-700
              bg-gray-200
              z-20
              rounded-md
              shadow-xl
              w-[15rem]
              pointer-event-none
              top-0
              right-1
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
import { onBeforeRouteLeave } from 'vue-router'

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
    onOpen() {
      if (this.show) {
        this.onClose()
      } else {
        this.show = true
      }
    },

    onClose() {
      this.show = false
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
