<template>
  <div class="jusctify-center fixed top-18 right-6 z-50 flex flex-col">
    <transition-group name="list" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="mb-2 flex cursor-pointer items-center rounded-lg border-r-4 px-3 py-2 shadow-md backdrop-blur-xs"
        :class="{
          'border-blue-700 bg-blue-500/70': toast.type === 'info',
          'border-red-700 bg-red-500/70': toast.type === 'error',
          'border-green-700 bg-green-500/70': toast.type === 'success',
        }"
        @click="removeToast(toast.id)"
      >
        <div
          class="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-white"
          :class="{
            'text-blue-500': toast.type === 'info',
            'text-red-500': toast.type === 'error',
            'text-green-500': toast.type === 'success',
          }"
        >
          <i
            class="fas fa-check block text-sm"
            :class="{
              'fa-info': toast.type === 'info',
              'fa-times': toast.type === 'error',
              'fa-check': toast.type === 'success',
            }"
          />
        </div>
        <div class="max-w-xs text-white">{{ toast.text }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { removeToast, toasts } from '@/store/globalstate.ts'
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
