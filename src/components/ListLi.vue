<template>
  <li
    v-long-press="() => onLongPress(item)"
    v-ripple="{ disable: noRipple }"
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
      flex flex-col
    "
    :style="$attrs.style + 'display: block; ' + item.style"
    :class="{
      seperator: item.type === 'seperator',
      [item.class]: item.class,
      'my-2': getSubText(item),
      'py-3 px-4': dense,
      'py-4 px-4': !dense,
      [$attrs.class]: !!$attrs.class,
    }"
    @click="onClick(item)"
  >
    <div v-if="render" class="w-full flex">
      <slot name="before" />
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

      <slot name="suffix-item" :item="item" />

      <ListHr v-if="!noSeparation" />
    </div>

    <slot name="after" :item="item" />
  </li>

  <ModalRadio
    :model-value="!!radio"
    :title="radio?.title"
    :storage-key="radio?.key"
    :radio-items="radio?.items"
    :default-value="radio?.default"
    @close="radio = null"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputBoolean from '@/components/InputBoolean.vue'
import { refstorage } from '@/store/globalstate'
import ListHr from '@/components/ListHr.vue'

const ModalRadio = defineAsyncComponent(() =>
  import('@/components/ModalRadio.vue'),
)

interface Props {
  item: Record<string, any>;
  noGutters?: boolean;
  dense?: boolean;
  noSeparation?: boolean;
  render?: boolean;
  itemTextKey?: string;
  noRipple?: boolean;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  item: () => ({}),
  noGutters: false,
  dense: false,
  noSeparation: false,
  render: true,
  itemTextKey: 'text',
  noRipple: false,
  isLoading: false
})

const emit = defineEmits<{
  (e: 'item', item: Record<string, any>): void;
  (e: 'long-press', item: Record<string, any>): void;
}>()

const router = useRouter()
const radio = ref<Record<string, any> | null>(null)

function isAnyLoading(): string | null {
  return props.isLoading ? 'click' : null
}

function onLongPress(item: Record<string, any>): void {
  if (isAnyLoading()) {
    return
  }

  emit('long-press', item)
}

function getIcon(item: Record<string, any>): any {
  return callFn(item, 'icon')
}

function getText(item: Record<string, any>): any {
  return callFn(item, props.itemTextKey)
}

function getSubText(item: Record<string, any>): any {
  if (item.radio && item.radio.key) {
    const key = refstorage.get(item.radio.key, item.radio.default)
    return item.radio.items.find((item: Record<string, any>) => item.value === key)?.text
  }

  return callFn(item, 'subtext')
}

function getBoolean(item: Record<string, any>): boolean {
  if (item.toggle) {
    return !!refstorage.get(item.toggle, !!item.toggleDefault)
  }

  return callFn(item, 'boolean')
}

function hasBoolean(item: Record<string, any>): boolean {
  if (item.toggle) {
    return true
  }

  return (
    typeof item.boolean === 'boolean' || typeof item.boolean === 'function'
  )
}

function callFn(item: Record<string, any>, key: string): any {
  if (typeof item[key] === 'function') {
    return item[key]()
  }
  return item[key]
}

function onClick(item: Record<string, any>): void {
  if (isAnyLoading()) {
    return
  }

  emit('item', item)

  if (item.radio) {
    radio.value = item.radio
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
