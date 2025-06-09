<template>
  <div>
    <TheHeader title="Error">
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>
    <div class="flex flex-col items-center justify-center p-8">
      <h1 class="mb-4 text-4xl font-bold">404</h1>
      <p class="mb-4 text-xl">Page Not Found</p>
      <p class="text-gray-600 dark:text-gray-400">
        The page you are looking for doesn't exist or has been moved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
</script>
