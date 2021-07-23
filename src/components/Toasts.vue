<template>
  <div class="flex flex-col jusctify-center fixed z-50 right-2 top-24">
    <transition-group name="list" tag="div">
      <div
        v-for="(toast, index) in toasts"
        :key="toast"
        class="
          flex
          items-center
          border-r-4
          rounded-lg
          py-2
          px-3
          shadow-md
          bg-opacity-70
          backdrop-filter backdrop-blur
          mb-2
        "
        :class="{
          'bg-blue-500 border-blue-700': toast.type === 'info',
          'bg-red-500 border-red-700': toast.type === 'error',
          'bg-green-500 border-green-700': toast.type === 'success',
        }"
        @click="removeToast(index)"
      >
        <div
          class="w-6 h-6 text-center rounded-full bg-white mr-3"
          :class="{
            'text-blue-500': toast.type === 'info',
            'text-red-500': toast.type === 'error',
            'text-green-500': toast.type === 'success',
          }"
        >
          <i
            class="mt-[0.2rem] block fas fa-check text-sm"
            :class="{
              'fa-info': toast.type === 'info',
              'fa-times': toast.type === 'error',
              'fa-check': toast.type === 'success',
            }"
          />
        </div>
        <div class="text-white max-w-xs">{{ toast.text }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { toasts } from '@/store/globalstate.js'

export default {
  name: 'Toasts',

  data() {
    return {
      toasts,
    }
  },
}
</script>

<style scoped>
.list-item {
  display: inline-block;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
