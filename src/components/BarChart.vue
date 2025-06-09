<template>
  <BarChart :chart-data="chartData" :options="chartOptions" :height="100" />
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { BarChart } from 'vue-chart-3'
import { computed } from 'vue'
import ChartDataLabels from 'chartjs-plugin-datalabels'

Chart.register(...registerables, ChartDataLabels)

const props = defineProps<{
  values: number[]
  dates?: Date[]
  showLabels?: boolean
  showValues?: boolean
}>()

const chartData = computed(() => {
  let labels = props.values.map((_, i) => String(i + 1))

  // If dates are provided and it's a 30-day view, format as day.month
  if (props.dates && props.dates.length > 0) {
    labels = props.dates.map((date) => {
      if (date instanceof Date) {
        return `${date.getDate()}.${date.getMonth() + 1}`
      }
      return ''
    })
  }

  return {
    labels,
    datasets: [
      {
        data: props.values,
        backgroundColor: '#3b82f6',
      },
    ],
  }
})

const chartOptions = computed(() => {
  // Create base options
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => `Value: ${context.raw}`,
        },
      },
      // Default to false for datalabels
      datalabels: false,
    },
  }

  // Add datalabels configuration if showValues is true
  if (props.showValues) {
    options.plugins.datalabels = {
      anchor: 'end',
      align: 'top',
      formatter: (value: number) => value,
      font: {
        weight: 'bold',
        size: 12,
      },
      color: '#666',
    }
  }

  return {
    ...options,
    scales: {
      x: {
        ticks: {
          display: props.showLabels || false,
          autoSkip: true,
          maxRotation: 90,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        ticks: { display: false },
        grid: { display: false },
        beginAtZero: true,
      },
    },
  }
})
</script>

<style scoped></style>
