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
        </div>
        <div>
          <h3 class="mb-1 text-sm font-semibold">Last 30 days</h3>
          <BarChart :values="last30" />
        </div>
        <div>
          <h3 class="mb-1 text-sm font-semibold">Answer buttons</h3>
          <BarChart :values="easeCounts" />
          <div class="mt-1 flex justify-between text-xs">
            <span>Again</span>
            <span>Hard</span>
            <span>Good</span>
            <span>Easy</span>
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
const last30 = ref<number[]>([])
const easeCounts = ref([0, 0, 0, 0])

onMounted(async () => {
  const revlogs = await wankidb.revlog.toArray()
  totalReviews.value = revlogs.length
  if (revlogs.length) {
    firstReview.value = new Date(
      Math.min(...revlogs.map((r) => r.id || 0)),
    ).toLocaleDateString()
  }
  const counts = new Map<string, number>()
  for (const rev of revlogs) {
    const d = new Date(rev.id || 0)
    d.setHours(0, 0, 0, 0)
    const k = d.toISOString()
    counts.set(k, (counts.get(k) || 0) + 1)
    if (rev.ease && rev.ease >= 1 && rev.ease <= 4) {
      easeCounts.value[rev.ease - 1]++
    }
  }
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
  last30.value = arr.slice(-30).map((d) => d.count)
})
</script>

<style scoped></style>
