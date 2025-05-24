<template>
  <ul
    class="w-full flex flex-col text-lg"
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
        focus:outline-hidden focus:ring-2 focus:ring-blue-500
        flex
        w-full
        items-center
        text-left
        mt-0
        mb-0
        min-h-12
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
        class="border border-gray-900 dark:border-gray-500 w-full"
      />

      <slot name="prefix-item" :item="item" />

      <i
        v-if="getIcon(item)"
        class="pr-4"
        :class="{ [getIcon(item)]: getIcon(item) }"
      />
      <div class="flex grow items-center">
        <span v-if="getText(item)" class="flex flex-col">
          {{ getText(item) }}
          <span
            v-if="getSubText(item)"
            class="grow text-sm text-gray-600 dark:text-gray-300 pr-2"
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

      <div v-if="hasText(item)" class="opacity-60">
        {{ getValueText(item) }}
      </div>

      <slot name="suffix-item" :item="item" />

      <ListHr v-if="!noSeparation && index < value.length - 1" />
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

  <ModalTextfield
    :model-value="!!textfield"
    :title="textfield?.title"
    :storage-key="textfield?.key"
    :type="textfield?.type"
    :label="textfield?.label"
    :placeholder="textfield?.placeholder"
    @close="textfield = null"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputBoolean from '@/components/InputBoolean.vue'
import { refstorage } from '@/store/globalstate'
import ListHr from '@/components/ListHr.vue'
import ModalTextfield from '@/components/ModalTextfield.vue'
const ModalRadio = defineAsyncComponent(() =>
  import('@/components/ModalRadio.vue'),
)

const props = defineProps({
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
  itemTextKey: {
    type: String,
    default: 'text',
  },
})

const emit = defineEmits(['item', 'long-press'])
const router = useRouter()

const radio = ref(null)
const textfield = ref(null)

const isAnyLoading = () => {
  return props.value.some((v) => callFn(v, 'loading')) ? 'click' : null
}

const onLongPress = (item) => {
  if (isAnyLoading()) {
    return
  }

  emit('long-press', item)
}

const getIcon = (item) => {
  return callFn(item, 'icon')
}

const getText = (item) => {
  return callFn(item, props.itemTextKey)
}

const getSubText = (item) => {
  if (item.radio && item.radio.key) {
    const key = refstorage.get(item.radio.key, item.radio.default)
    return item.radio.items.find((item) => item.value === key)?.text
  }

  return callFn(item, 'subtext')
}

const getBoolean = (item) => {
  if (item.toggle) {
    return !!refstorage.get(item.toggle)
  }

  return callFn(item, 'boolean')
}

const getValueText = (item) => {
  return refstorage.get(item.key)
}

const hasBoolean = (item) => {
  if (item.toggle) {
    return true
  }

  return (
    typeof item.boolean === 'boolean' || typeof item.boolean === 'function'
  )
}

const hasText = (item) => {
  if (item.kind && item.kind === 'textfield') {
    return true
  }
}

const callFn = (item, key) => {
  if (typeof item[key] === 'function') {
    return item[key]()
  }
  return item[key]
}

const onClick = (item) => {
  if (isAnyLoading()) {
    return
  }

  emit('item', item)

  if (item.radio) {
    radio.value = item.radio
  }

  if (item.kind === 'textfield') {
    textfield.value = item
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

  if (item.dispatch) {
    item.dispatch(item)
  }
}
</script>

<style scoped>
li {
  min-height: fit-content;
}
</style>
