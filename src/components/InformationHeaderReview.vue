<template>
  <div
    class="
      z-10
      top-0
      sticky
      flex
      justify-between
      dark:bg-gray-800/50
      bg-gray-400/20
      px-3
      py-1
      text-sm
      backdrop-blur-xs
    "
  >
    <div class="flex">
      <NumberDue
        :underline="current === 0"
        :high-contrast="false"
        :value="remaining[0]"
        color="blue"
      />
      <NumberDue
        :underline="current === 1"
        :high-contrast="false"
        :value="remaining[1]"
        color="red"
      />
      <NumberDue
        :underline="current === 2"
        :high-contrast="false"
        :value="remaining[2]"
        color="green"
      />
    </div>

    <div>{{ timer }}</div>
  </div>
</template>

<script setup lang="ts">
import NumberDue from '@/components/NumberDue.vue'

interface Props {
  timer?: string
  current?: number
  remaining?: number[]
}

withDefaults(defineProps<Props>(), {
  timer: '01:22',
  current: 0,
  remaining: () => [0, 0, 0]
})
</script>

<style scoped></style>
