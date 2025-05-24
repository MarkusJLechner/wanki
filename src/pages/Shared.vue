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

<script>
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

export default {
  components: { ThemeSwitcher, FlexSpacer, TheHeader },

  data() {
    return {
      details: [],
    }
  },

  created() {
    self.addEventListener('fetch', (event) => {
      const url = new URL(event.request.url)
      if (event.request.method === 'POST' && url.pathname === '/bookmark') {
        event.respondWith(
          (async () => {
            const formData = await event.request.formData()
            const link = formData.get('link') || ''
            this.details = link
            console.log(formData)
            return new Response(link)
          })(),
        )
      }
    })
  },
}
</script>
