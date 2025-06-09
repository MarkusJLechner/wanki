<template>
  <div>
    <TheHeader title="Statistics">
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>
    <MainContent>
      <div class="space-y-4 p-4">
        <CalendarHeatmap
          :dark-mode="darkTheme"
          :round="8"
          tooltip-unit="reviews"
          :range-color="[
            '#ebedf0',
            'rgba(0,0,0,0.08)',
            '#40c463',
            '#30a14e',
            '#216e39',
          ]"
          :values="calendar"
          :end-date="new Date()"
        />
        <div class="space-y-1 text-sm">
          <div>Total reviews: {{ totalReviews }}</div>
          <div>First review: {{ firstReview || '-' }}</div>
          <div>Active days: {{ activeDays }}</div>
          <div>Average reviews per active day: {{ averageReviews }}</div>
          <div>Longest streak: {{ longestStreak }} days</div>
          <div>Unique cards reviewed: {{ uniqueCards }}</div>
          <div>Total study time: {{ totalTime }} min</div>
          <div>Average review time: {{ averageTime }} s</div>
        </div>
        <div>
          <h3 class="mb-1 text-sm font-semibold">Last 30 days</h3>
          <BarChart
            :values="last30"
            :dates="last30Dates"
            :show-labels="true"
            :show-values="true"
          />
        </div>
        <div>
          <h3 class="mb-1 text-sm font-semibold">Answer buttons</h3>
          <BarChart :values="easeCounts" :show-values="true" />
          <div class="mt-1 flex justify-between text-xs">
            <span>Again</span>
            <span>Hard</span>
            <span>Good</span>
            <span>Easy</span>
          </div>
        </div>
        <div>
          <h3 class="mb-1 text-sm font-semibold">
            Review Time Distribution (min)
          </h3>
          <BarChart :values="reviewTimeDistribution" :show-values="true" />
          <div class="mt-1 flex justify-between text-xs">
            <span>0-1</span>
            <span>1-2</span>
            <span>2-5</span>
            <span>5-10</span>
            <span>&gt;10</span>
          </div>
        </div>
      </div>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import MainContent from '@/components/MainContent.vue'
import { CalendarHeatmap } from 'vue3-calendar-heatmap'
import 'vue3-calendar-heatmap/dist/style.css'
import 'tippy.js/dist/tippy.css'
// import 'tippy.js/dist/svg-arrow.css'
import BarChart from '@/components/BarChart.vue'
import { wankidb } from '@/plugins/wankidb/db'
import { refstorage } from 'store/globalstate.ts'
const darkTheme = refstorage.ref('darkTheme')

interface DayEntry {
  date: Date
  count: number
}

const calendar = ref<DayEntry[]>([])
const totalReviews = ref(0)
const activeDays = ref(0)
const firstReview = ref('')
const averageReviews = ref('0')
const longestStreak = ref(0)
const uniqueCards = ref(0)
const averageTime = ref('0')
const totalTime = ref('0')
const last30 = ref<number[]>([])
const last30Dates = ref<Date[]>([])
const easeCounts = ref([0, 0, 0, 0])
const reviewTimeDistribution = ref<number[]>([0, 0, 0, 0, 0]) // 0-1min, 1-2min, 2-5min, 5-10min, >10min

onMounted(async () => {
  const revlogs = await wankidb.revlog.toArray()
  totalReviews.value = revlogs.length
  if (revlogs.length) {
    firstReview.value = new Date(
      Math.min(...revlogs.map((r) => r.id || 0)),
    ).toLocaleDateString()
  }
  const counts = new Map<string, number>()
  const cards = new Set<number>()
  let timeSum = 0
  for (const rev of revlogs) {
    const d = new Date(rev.id || 0)
    d.setHours(0, 0, 0, 0)
    const k = d.toISOString()
    counts.set(k, (counts.get(k) || 0) + 1)
    if (rev.ease && rev.ease >= 1 && rev.ease <= 4) {
      easeCounts.value[rev.ease - 1]++
    }
    if (rev.cid) cards.add(rev.cid)
    if (typeof rev.time === 'number') timeSum += rev.time
  }
  uniqueCards.value = cards.size
  totalTime.value = (timeSum / 60000).toFixed(1)
  averageTime.value = revlogs.length
    ? (timeSum / revlogs.length / 1000).toFixed(1)
    : '0'
  activeDays.value = counts.size
  averageReviews.value = activeDays.value
    ? (totalReviews.value / activeDays.value).toFixed(1)
    : '0'
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - 364)
  const arr: DayEntry[] = []
  const date = new Date(start)
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const iso = date.toISOString()
    const count = counts.get(iso) || 0
    arr.push({ date: new Date(date), count })
    if (count > 0) {
      streak += 1
      if (streak > longestStreak.value) longestStreak.value = streak
    } else {
      streak = 0
    }
    date.setDate(date.getDate() + 1)
  }
  calendar.value = arr

  // Get the last 30 days data with dates
  const last30Data = arr.slice(-30)
  last30.value = last30Data.map((d) => d.count)
  last30Dates.value = last30Data.map((d) => d.date)

  // Calculate review time distribution
  const timeDistribution = [0, 0, 0, 0, 0]
  for (const rev of revlogs) {
    if (typeof rev.time === 'number') {
      const timeInMinutes = rev.time / 60000
      if (timeInMinutes <= 1) timeDistribution[0]++
      else if (timeInMinutes <= 2) timeDistribution[1]++
      else if (timeInMinutes <= 5) timeDistribution[2]++
      else if (timeInMinutes <= 10) timeDistribution[3]++
      else timeDistribution[4]++
    }
  }
  reviewTimeDistribution.value = timeDistribution
})
</script>

<style scoped></style>
