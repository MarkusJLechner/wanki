<template>
  <transition name="fade" appear>
    <div
      v-if="modelValue"
      class="
        fixed
        z-20
        inset-0
        bg-gray-900/50
        transition-opacity
        backdrop-grayscale
      "
      aria-hidden="true"
      @click.stop="onClose"
    ></div>
  </transition>
  <transition name="slide-open" appear>
    <div
      v-if="modelValue"
      class="fixed z-20 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="
          flex
          h-full
          items-center
          justify-center
          pt-4
          px-4
          pb-20
          text-center
        "
      >
        <div
          v-if="modelValue"
          class="fixed z-10 inset-0 transition-opacity"
          aria-hidden="true"
          @click.stop="onClose"
        ></div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-full"
          aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="
            z-50
            inline-block
            align-bottom
            dark:bg-gray-700
            bg-white
            dark:text-white
            text-gray-800
            rounded-lg
            text-left
            overflow-hidden
            shadow-xl
            p-1
            min-w-[20rem]
            transition-all
            max-h-[85vh]
            relative
            flex flex-col
          "
        >
          <h1 class="px-4 py-2 font-bold">{{ title }}</h1>
          <div
            style="box-shadow: rgb(0 0 0 / 6%) 0 2px 20px 10px inset"
            class="overflow-y-auto grow"
            :class="{ 'p-4': !noGutters, [contentClass]: !!contentClass }"
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

interface Action {
  text: string
  value: string | number
  [key: string]: any
}

interface Props {
  modelValue?: boolean
  loading?: boolean
  title?: string
  cancelText?: string | Function
  noGutters?: boolean
  confirm?: boolean | string
  contentClass?: string
  disableConfirm?: boolean
  actions?: Action[]
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
})

const emit = defineEmits<{
  (e: 'click:action', action: Action): void
  (e: 'confirm'): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'update:modelValue', value: boolean): void
  (e: 'visible', value: boolean): void
}>()

const show = ref(false)

watch(() => props.modelValue, (newValue) => {
  show.value = !!newValue
  emit('visible', !!newValue)
  modalOpened.value = !!newValue
}, { immediate: true })

onMounted(() => {
  onBeforeRouteLeave(() => {
    if (show.value) {
      onClose()
      return false
    }
    return true
  })
})

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

const onAction = (action: Action) => {
  emit('click:action', action)
}
</script>
