<template>
  <div>
    <TheHeader title="Shared">
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>
    <h1>Shared</h1>
    {{ details }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const details = ref<string | string[]>([])

onMounted(() => {
  self.addEventListener('fetch', (event: FetchEvent) => {
    const url = new URL(event.request.url)
    if (event.request.method === 'POST' && url.pathname === '/bookmark') {
      event.respondWith(
        (async () => {
          const formData = await event.request.formData()
          const link = formData.get('link') || ''
          details.value = link
          console.log(formData)
          return new Response(link)
        })(),
      )
    }
  })
})
</script>
