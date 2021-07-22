<template>
  <ul
    class="w-full flex flex-col text-lg overflow-y-auto"
    :class="{
      'py-2': !noGutters,
      'text-gray-600 dark:text-gray-400': isAnyLoading(),
    }"
    @[isAnyLoading()].capture.stop.prevent
  >
    <li
      v-for="(item, index) in value"
      :key="index"
      v-long-press="() => onLongPress(item)"
      v-ripple
      class="
        select-none
        cursor-pointer
        relative
        focus:outline-none
        focus:ring-2 focus:ring-blue-500
        flex
        w-full
        items-center
        text-left
        mt-0
        mb-0
        min-h-[3rem]
      "
      :style="item.style"
      :class="{
        seperator: item.type === 'seperator',
        [item.class]: item.class,
        'my-2': getSubText(item),
        'py-3 px-4': dense,
        'py-4 px-4': !dense,
      }"
      @click.prevent="onClick(item)"
    >
      <component :is="item.component" v-if="item.component" />
      <hr
        v-if="item.type === 'seperator'"
        class="border-1 border-gray-900 dark:border-gray-500 w-full"
      />

      <slot name="prefix-item" :item="item" />

      <i
        v-if="getIcon(item)"
        class="pr-4"
        :class="{ [getIcon(item)]: getIcon(item) }"
      />
      <div class="flex flex-grow items-center">
        <span v-if="getText(item)" class="flex flex-col">
          {{ getText(item) }}
          <span
            v-if="getSubText(item)"
            class="flex-grow text-sm text-gray-600 dark:text-gray-300 pr-2"
            >{{ getSubText(item) }}</span
          >
        </span>

        <div v-if="callFn(item, 'loading')" class="px-2">
          <i class="text-black dark:text-white fas fa-spinner fa-spin" />
        </div>
      </div>

      <div v-if="hasBoolean(item)">
        <InputBoolean :model-value="getBoolean(item)" />
      </div>

      <slot name="suffix-item" :item="item" />

      <hr
        v-if="!noSeparation && index < value.length - 1"
        class="
          -bottom-0
          absolute
          border-1 border-gray-900
          dark:border-gray-500
          left-0
          right-0
          block
        "
      />
    </li>
  </ul>

  <ModalRadio
    :model-value="!!radio"
    :title="radio?.title"
    :storage-key="radio?.key"
    :radio-items="radio?.items"
    :default-value="radio?.default"
    @close="radio = null"
  />
</template>

<script>
import { defineAsyncComponent } from 'vue'
import InputBoolean from 'components/InputBoolean.vue'
import { refstorage } from 'store/globalstate.js'
const ModalRadio = defineAsyncComponent(() =>
  import('components/ModalRadio.vue'),
)

export default {
  name: 'List',

  components: {
    InputBoolean,
    ModalRadio,
  },

  props: {
    value: {
      type: Array,
      default: () => [],
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
  },

  emits: ['item', 'long-press'],

  data() {
    return {
      radio: null,
    }
  },

  methods: {
    isAnyLoading() {
      return this.value.some((v) => this.callFn(v, 'loading')) ? 'click' : null
    },

    onLongPress(item) {
      if (this.isAnyLoading()) {
        return
      }

      this.$emit('long-press', item)
    },

    getIcon(item) {
      return this.callFn(item, 'icon')
    },

    getText(item) {
      return this.callFn(item, 'text')
    },

    getSubText(item) {
      if (item.radio && item.radio.key) {
        const key = refstorage.get(item.radio.key, item.radio.default)
        return item.radio.items.find((item) => item.value === key)?.text
      }

      return this.callFn(item, 'subtext')
    },

    getBoolean(item) {
      if (item.toggle) {
        return !!refstorage.get(item.toggle, !!item.toggleDefault)
      }

      return this.callFn(item, 'boolean')
    },

    hasBoolean(item) {
      if (item.toggle) {
        return true
      }

      return (
        typeof item.boolean === 'boolean' || typeof item.boolean === 'function'
      )
    },

    callFn(item, key) {
      if (typeof item[key] === 'function') {
        return item[key]()
      }
      return item[key]
    },

    onClick(item) {
      if (this.isAnyLoading()) {
        return
      }

      this.$emit('item', item)

      if (item.radio) {
        this.radio = item.radio
      }

      if (item.toggle) {
        refstorage.toggle(item.toggle)
      }

      if (item.click) {
        item.click(item)
      }

      if (item.route) {
        this.$router.push({ path: item.route })
      }

      if (item.dispatch) {
        item.dispatch(item)
      }
    },
  },
}
</script>
