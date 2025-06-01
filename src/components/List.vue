<template>
  <DynamicScroller
    class="scroller"
    v-bind="$attrs"
    :items="computedValue"
    :min-item-size="computedItemSize"
    listTag="ul"
    itemTag="li"
    listClass="flex w-full flex-col text-lg"
    @[isAnyLoading()].capture.stop.prevent
    itemClass=""
    key-field="index"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[getText(item), getSubText(item)]"
        :data-index="index"
      >
        <div
          :style="item.style"
          v-ripple
          @click.prevent="onClick(item)"
          :class="[
            'relative mt-0 mb-0 flex min-h-12 w-full cursor-pointer items-center text-left select-none focus:ring-2 focus:ring-blue-500 focus:outline-hidden',
            {
              seperator: item.type === 'seperator',
              ...(item.class ? { [item.class]: true } : {}),
              'my-2': getSubText(item),
              'px-4 py-3': dense,
              'px-4 py-4': !dense,
            },
          ]"
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
            :class="getIcon(item) ? { [getIcon(item)]: true } : {}"
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
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>

  <ModalRadio
    :show="!!radioItem"
    v-model="radioInput"
    :title="radioItem?.radio!.title ?? ''"
    :radio-items="radioItem?.radio!.items ?? []"
    @item="(item) => onConfirm(radioItem, item.value)"
    @close="radioItem = null"
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
  DynamicScroller,
  DynamicScrollerItem,
} from 'vue-virtual-scroller/dist/vue-virtual-scroller.esm'
import { defineAsyncComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputBoolean from '@/components/InputBoolean.vue'
import { refstorage } from '@/store/globalstate'
import ListHr from '@/components/ListHr.vue'
import ModalTextfield from '@/components/ModalTextfield.vue'
import type { ListItem, ListProps } from '@/components/List'
const ModalRadio = defineAsyncComponent(
  () => import('@/components/ModalRadio.vue'),
)

const props = withDefaults(defineProps<ListProps>(), {
  value: () => [],
  noGutters: false,
  dense: false,
  noSeparation: false,
  itemTextKey: 'text',
  itemSize: 60,
})

const emit = defineEmits<{
  item: [item: ListItem]
  'long-press': [item: ListItem]
}>()
const router = useRouter()

const computedValue = computed(() => {
  return props.value.map((v, i) => ({
    ...v,
    index: i,
  }))
})

const computedItemSize = computed(() => {
  return props.itemSize
})

const radioItem = ref<ListItem | null>(null)
const textfield = ref<ListItem | null>(null)
const radioInput = ref<string>('')
const textfieldInput = ref<string>('')

function onConfirm(
  item: ListItem | null,
  value: string | number | boolean,
): void {
  if (item?.storeLocal) {
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
    const key = item.storeDb
      ? item.storeDb.get()
      : refstorage.get(item.radio.key, item.radio.default)
    return item.radio.items.find((item) => item.value === key)?.text
  }

  return callFn(item, 'subtext')
}

const getBoolean = (item: ListItem): boolean => {
  if (item.toggle) {
    return !!refstorage.get(item.toggle)
  }

  if (item.storeDb) {
    return !!item.storeDb.get()
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

  if (item.storeDb && typeof item.storeDb.get() === 'boolean') {
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
    radioInput.value = item.storeDb
      ? (item.storeDb.get() as string)
      : refstorage.get(item.radio.key, item.radio.default)
    radioItem.value = item
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
  } else if (item.storeDb && hasBoolean(item)) {
    item.storeDb.save(!getBoolean(item))
  }

  if (item.click) {
    item.click(item)
  }

  if (item.route) {
    void router.push({ path: item.route, query: item.routeQuery })
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
