<template>
  <div
    class="
      z-10
      top-0
      sticky
      flex
      justify-between
      dark:bg-gray-800
      bg-gray-400 bg-opacity-20
      dark:bg-opacity-50
      px-3
      py-1
      text-sm
      backdrop-filter backdrop-blur
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

<script>
import NumberDue from '@/components/NumberDue.vue'
export default {
  name: 'InformationHeaderReview',
  components: { NumberDue },
  props: {
    timer: {
      type: String,
      default: '01:22',
    },

    current: {
      type: Number,
      default: 0,
    },

    remaining: {
      type: Array,
      default: () => [1, 2, 3],
    },
  },
}
</script>

<style scoped></style>
