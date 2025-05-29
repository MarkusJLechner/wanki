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
const ModalRadio = defineAsyncComponent(
  () => import('@/components/ModalRadio.vue'),
)

interface RadioItem {
  /**
   * Display text for the radio option
   */
  text: string
  /**
   * Value associated with the radio option
   */
  value: string | number
}

interface ListItemRadio {
  /**
   * Title displayed in the radio modal
   */
  title: string
  /**
   * Storage key for saving the selected value
   */
  key: string
  /**
   * Default value when no selection is made
   */
  default: string | number
  /**
   * Array of radio options to display
   */
  items: Array<RadioItem>
}

interface ListItem {
  /**
   * Main text displayed for the list item
   */
  text?: string
  /**
   * Secondary text displayed below the main text
   */
  subtext?: string | (() => string)
  /**
   * Storage key for toggle state
   */
  toggle?: string
  /**
   * Default value for toggle
   */
  toggleDefault?: boolean
  /**
   * Icon class to display before the text
   */
  icon?: string | (() => string)
  /**
   * Type of list item (e.g., 'textfield')
   */
  kind?: string
  /**
   * Storage key for item value
   */
  key?: string
  /**
   * Placeholder text for input fields
   */
  placeholder?: string
  /**
   * Visual type of the item (e.g., 'seperator')
   */
  type?: string
  /**
   * Title for modals triggered by this item
   */
  title?: string
  /**
   * Radio configuration for this item
   */
  radio?: ListItemRadio
  /**
   * Boolean value or function returning boolean
   */
  boolean?: boolean | (() => boolean)
  /**
   * Loading state indicator
   */
  loading?: boolean | (() => boolean)
  /**
   * Custom component to render
   */
  component?: any
  /**
   * CSS class to apply to the item
   */
  class?: string
  /**
   * Inline styles to apply to the item
   */
  style?: any
  /**
   * Function called when item is clicked
   */
  click?: (item: ListItem) => void
  /**
   * Route to navigate to when clicked
   */
  route?: string
  /**
   * Query parameters for route navigation
   */
  routeQuery?: Record<string, string>
  /**
   * Function to dispatch when item is clicked
   */
  dispatch?: (item: ListItem) => void
}

interface Props {
  /**
   * Array of list items to display
   */
  value: Array<ListItem>
  /**
   * Whether to remove padding around the list
   */
  noGutters?: boolean
  /**
   * Whether to use compact spacing for list items
   */
  dense?: boolean
  /**
   * Whether to hide separators between list items
   */
  noSeparation?: boolean
  /**
   * Property name to use for item text
   */
  itemTextKey?: string
}

const props = withDefaults(defineProps<Props>(), {
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
  return refstorage.get(item.key)
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
