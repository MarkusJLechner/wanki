import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createApp } from 'vue'

const routes = [
  { path: '/', component: { template: '<div />' } },
  { path: '/browser', component: { template: '<div />' } },
  { path: '/help', component: { template: '<div />' } },
  { path: '/support', component: { template: '<div />' } },
  { path: '/shared', component: { template: '<div />' } },
  { path: '/statistics', component: { template: '<div />' } },
  { path: '/review/on', component: { template: '<div />' } },
  { path: '/deck/options', component: { template: '<div />' } },
  { path: '/deck/browse', component: { template: '<div />' } },
  { path: '/card/info', component: { template: '<div />' } },
  { path: '/card/edit', component: { template: '<div />' } },
  { path: '/note/add', component: { template: '<div />' } },
  { path: '/settings/overview', component: { template: '<div />' } },
  { path: '/setting/wanki/general', component: { template: '<div />' } },
  { path: '/setting/wanki/advanced', component: { template: '<div />' } },
  { path: '/setting/wanki/appearance', component: { template: '<div />' } },
  { path: '/setting/wanki/gestures', component: { template: '<div />' } },
  { path: '/setting/wanki/reviewing', component: { template: '<div />' } },
  { path: '/setting/wanki/fsrs', component: { template: '<div />' } },
  { path: '/:catchAll(.*)', component: { template: '<div>404</div>' } },
]

describe('Router navigation', () => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  createApp({ template: '<router-view />' }).use(router)

  it('navigates from param route to route without params', async () => {
    await router.push('/review/on?deckid=1')
    await router.push('/help')
    expect(router.currentRoute.value.fullPath).toBe('/help')
  })

  it('visits each route without hitting 404', async () => {
    const paths = routes
      .map((r) => r.path)
      .filter((p) => !p.includes(':catchAll'))
      .sort(() => Math.random() - 0.5)
    for (const path of paths) {
      await router.push(path)
      expect(router.currentRoute.value.matched[0].path).toBe(path)
    }
  })
})
