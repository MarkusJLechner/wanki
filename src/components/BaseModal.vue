<template>
  <transition name="fade" appear>
    <div
      v-if="modelValue"
      class="fixed inset-0 z-20 bg-gray-900/50 backdrop-grayscale transition-opacity"
      aria-hidden="true"
      @click.stop="onClose"
    ></div>
  </transition>
  <transition name="slide-open" appear>
    <div
      v-if="modelValue"
      v-bind="$attrs"
      class="fixed inset-0 z-20 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex h-full text-center"
        :class="fullscreen ? '' : 'items-center justify-center px-4 pt-4 pb-20'"
      >
        <div
          v-if="modelValue"
          class="fixed inset-0 z-10 transition-opacity"
          aria-hidden="true"
          @click.stop="onClose"
        ></div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span
          class="hidden sm:inline-block sm:h-full sm:align-middle"
          aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="relative z-50 flex flex-col overflow-hidden bg-white p-1 text-left align-bottom text-gray-800 shadow-xl transition-all dark:bg-gray-700 dark:text-white"
          :class="
            fullscreen
              ? 'h-full w-full rounded-none'
              : 'max-h-[85vh] min-w-[20rem] rounded-lg'
          "
        >
          <h1 class="px-4 py-2 font-bold">{{ title }}</h1>
          <div
            style="box-shadow: rgb(0 0 0 / 6%) 0 2px 20px 10px inset"
            class="relative grow overflow-y-auto"
            :class="{ 'p-4': !noGutters, ['' + contentClass]: !!contentClass }"
          >
            <slot />
          </div>

          <ButtonActions
            :confirm="confirm"
            :actions="actions"
            :disable-confirm="disableConfirm"
            :cancel-text="cancelText"
            :loading="loading"
            @close="onClose"
            @confirm="onConfirm"
            @click:action="onAction"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import ButtonActions from '@/components/ButtonActions.vue'
import { modalOpened } from '@/store/globalstate.ts'
import { onBeforeRouteLeave } from 'vue-router'
import type { Action } from '@/components/ButtonActions'

interface Props {
  modelValue?: boolean
  loading?: boolean
  title?: string
  cancelText?: string | (() => string)
  noGutters?: boolean
  confirm?: boolean | string
  contentClass?: string
  disableConfirm?: boolean
  actions?: Action[]
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  title: '',
  cancelText: undefined,
  noGutters: false,
  confirm: undefined,
  contentClass: '',
  disableConfirm: false,
  actions: undefined,
  fullscreen: false,
})

const emit = defineEmits<{
  'click:action': [action: Action]
  confirm: []
  open: []
  close: []
  'update:modelValue': [value: boolean]
  visible: [value: boolean]
}>()

const show = ref(false)

watch(
  () => props.modelValue,
  (newValue) => {
    show.value = !!newValue
    emit('visible', !!newValue)
    modalOpened.value = !!newValue
  },
  { immediate: true },
)

onMounted(() => {
  // router.push will not work in dispatch when modal cloases
  // Error guard afterEach - Navigation aborted from ... via a navigation guard.
  onBeforeRouteLeave(() => {
    if (show.value) {
      onClose()
      // prevent back fix https://github.com/MarkusJLechner/wanki/commit/a907db731e5821ddb7e67d49a3af47c7d4a8c544
      // why was this needed?
      return true
    }
    return true
  })
})

// This function is exported for programmatic modal opening
const open = () => {
  emit('open')
  emit('update:modelValue', true)
  show.value = true
}

const onClose = () => {
  if (props.loading) {
    return
  }

  emit('close')
  closeModal()
}

const onConfirm = () => {
  emit('confirm')
}

const closeModal = () => {
  emit('update:modelValue', false)
  show.value = false
}

const onAction = (action: Action): void => {
  emit('click:action', action)
}

defineExpose({ open, closeModal })
</script>
