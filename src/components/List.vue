<template>
  <ul
    v-bind="$attrs"
    class="flex w-full flex-col text-lg"
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
      class="relative mt-0 mb-0 flex min-h-12 w-full cursor-pointer items-center text-left select-none focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
      :style="item.style"
      :class="{
        seperator: item.type === 'seperator',
        [item.class]: item.class,
        'my-2': getSubText(item),
        'px-4 py-3': dense,
        'px-4 py-4': !dense,
      }"
      @click.prevent="onClick(item)"
    >
      <component :is="item.component" v-if="item.component" />
      <hr
        v-if="item.type === 'seperator'"
        class="w-full border border-gray-900 dark:border-gray-500"
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
            class="grow pr-2 text-sm text-gray-600 dark:text-gray-300"
            >{{ getSubText(item) }}</span
          >
        </span>

        <div v-if="callFn(item, 'loading')" class="px-2">
          <i class="fas fa-spinner fa-spin text-black dark:text-white" />
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
    :show="!!radio"
    v-model="radioInput"
    :title="radio?.title"
    :radio-items="radio?.items"
    @item="(item) => refstorage.set(radio!.key, item.value)"
    @close="radio = null"
  />

  <ModalTextfield
    confirm
    :show="!!textfield"
    v-model="textfieldInput"
    :title="textfield?.title"
    :type="textfield?.type"
    :label="textfield?.label"
    :placeholder="textfield?.placeholder"
    @close="textfield = null"
    @confirm="(value) => onConfirm(textfield, value)"
  />
</template>

<script setup lang="ts">
import {
  defineAsyncComponent,
  ref,
  watch,
  watchEffect,
  onBeforeUnmount,
} from 'vue'
import { useRouter } from 'vue-router'
import InputBoolean from '@/components/InputBoolean.vue'
import { refstorage } from '@/store/globalstate'
import ListHr from '@/components/ListHr.vue'
import ModalTextfield from '@/components/ModalTextfield.vue'
import { wankidb } from '@/plugins/wankidb/db'
import { ListItem, ListProps, ListItemRadio } from '@/components/List'
const ModalRadio = defineAsyncComponent(
  () => import('@/components/ModalRadio.vue'),
)

const props = withDefaults(defineProps<ListProps>(), {
  value: () => [],
  noGutters: false,
  dense: false,
  noSeparation: false,
  itemTextKey: 'text',
})

const emit = defineEmits<{
  item: [item: ListItem]
  'long-press': [item: ListItem]
}>()
const router = useRouter()

const radio = ref<ListItemRadio | null>(null)
const textfield = ref<ListItem | null>(null)
const radioInput = ref<string>('')
const textfieldInput = ref<string>('')

function onConfirm(item: ListItem | null, value: string): void {
  if (item && item.storeLocal) {
    refstorage.set(item.storeLocal, value)
  }
  if (item?.storeDb) {
    item.storeDb.save(value)
  }
  textfield.value = null
}

const isAnyLoading = (): string | null => {
  return props.value.some((v) => callFn(v, 'loading')) ? 'click' : null
}

const onLongPress = (item: ListItem): void => {
  if (isAnyLoading()) {
    return
  }

  emit('long-press', item)
}

const getIcon = (item: ListItem): string | undefined => {
  return callFn(item, 'icon')
}

const getText = (item: ListItem): string | undefined => {
  return callFn(item, props.itemTextKey)
}

const getSubText = (item: ListItem): string | undefined => {
  if (item.radio && item.radio.key) {
    const key = refstorage.get(item.radio.key, item.radio.default)
    return item.radio.items.find((item) => item.value === key)?.text
  }

  return callFn(item, 'subtext')
}

const getBoolean = (item: ListItem): boolean => {
  if (item.toggle) {
    return !!refstorage.get(item.toggle)
  }

  return !!callFn(item, 'boolean')
}

const getValueText = (item: ListItem): any => {
  if (item.storeDb) {
    return item.storeDb.get()
  }
  if (!item.storeLocal) {
    return undefined
  }
  return refstorage.get(item.storeLocal)
}

const hasBoolean = (item: ListItem): boolean => {
  if (item.toggle) {
    return true
  }

  return typeof item.boolean === 'boolean' || typeof item.boolean === 'function'
}

const hasText = (item: ListItem): boolean => {
  if (item.kind && item.kind === 'textfield') {
    return true
  }
  return false
}

const callFn = (item: ListItem, key: string): any => {
  if (typeof item[key] === 'function') {
    return item[key]()
  }
  return item[key]
}

const onClick = (item: ListItem): void => {
  if (isAnyLoading()) {
    return
  }

  emit('item', item)

  if (item.radio) {
    radioInput.value = refstorage.get(item.radio.key, item.radio.default)
    radio.value = item.radio
  }

  if (item.kind === 'textfield') {
    if (item.storeLocal) {
      textfieldInput.value = refstorage.get(item.storeLocal, '') as string
    } else if (item.storeDb) {
      textfieldInput.value = item.storeDb.get() as string
    } else {
      textfieldInput.value = ''
    }
    textfield.value = item
  }

  if (item.toggle) {
    refstorage.toggle(item.toggle)
  }

  if (item.click) {
    item.click(item)
  }

  if (item.route) {
    router.push({ path: item.route, query: item.routeQuery })
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
