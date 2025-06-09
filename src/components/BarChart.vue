<template>
  <BarChart :chart-data="chartData" :options="chartOptions" :height="100" />
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { BarChart } from 'vue-chart-3'
import { computed } from 'vue'

Chart.register(...registerables)

const props = defineProps<{ values: number[] }>()

const chartData = computed(() => ({
  labels: props.values.map((_, i) => String(i + 1)),
  datasets: [
    {
      data: props.values,
      backgroundColor: '#3b82f6',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: { display: false },
      grid: { display: false },
    },
    y: {
      ticks: { display: false },
      grid: { display: false },
      beginAtZero: true,
    },
  },
}
</script>

<style scoped></style>
