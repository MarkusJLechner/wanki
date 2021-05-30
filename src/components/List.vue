<template>
  <ul class="w-full text-lg" :class="{ 'py-2': !noGutters }">
    <li
      v-for="(item, index) in value"
      :key="index"
      class="
        relative
        focus:outline-none
        focus:ring-2 focus:ring-blue-500
        flex
        w-full
        items-center
        py-4
        px-4
        mt-0
        mb-0
        min-h-[3rem]
      "
      :style="item.style"
      :class="{
        seperator: item.type === 'seperator',
        [item.class]: item.class,
        'my-2': getSubText(item),
      }"
      @click="onClick(item)"
    >
      <hr
        v-if="item.type === 'seperator'"
        class="border-1 border-gray-900 dark:border-gray-500 w-full"
      />
      <slot name="prefix-item" :item="item"></slot>
      <i
        v-if="getIcon(item)"
        class="pr-4"
        :class="{ [getIcon(item)]: getIcon(item) }"
      />
      <span v-if="getText(item)" class="flex-grow flex flex-col">
        {{ getText(item) }}
        <span
          v-if="getSubText(item)"
          class="flex-grow text-sm text-gray-600 dark:text-gray-300 pr-2"
          >{{ getSubText(item) }}</span
        >
      </span>

      <div v-if="hasBoolean(item)">
        <InputBoolean :model-value="getBoolean(item)" />
      </div>

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
import router from '../router'
import { refstorage } from '../store/globalstate.js'
import { defineAsyncComponent } from 'vue'

const ModalRadio = defineAsyncComponent(() => import('./ModalRadio.vue'))
const InputBoolean = defineAsyncComponent(() => import('./InputBoolean.vue'))

export default {
  components: {
    ModalRadio,
    InputBoolean,
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

    noSeparation: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['item'],

  data() {
    return {
      radio: null,
    }
  },

  methods: {
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
      this.$emit('item', item)

      if (item.radio) {
        this.radio = item.radio
        /*
        * radio: {
            title: 'Deck for new cards',
            key: 'setting/general/use-card',
            default: 'current-deck',
            items: [
              { text: 'Use current deck', value: 'current-deck' },
              { text: 'Decide by note type', value: 'note-type' },
            ],
          }
        * */
      }

      if (item.toggle) {
        refstorage.toggle(item.toggle)
      }

      if (item.click) {
        item.click(item)
      }

      if (item.route) {
        router.push({ path: item.route })
      }

      if (item.emit) {
        this.$emit(item.emit, item)
      }
    },
  },
}
</script>
