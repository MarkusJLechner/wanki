import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidepanel from '../../src/components/Sidepanel.vue'

vi.mock('../../src/components/ButtonIcon.vue', () => ({
  default: { template: '<button class="btn" />' },
}))
vi.mock('../../src/components/List.vue', () => ({
  default: { template: '<ul class="list" />' },
}))
vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }))

describe('Sidepanel.vue', () => {
  it('toggles navigation via method', async () => {
    const wrapper = mount(Sidepanel)
    ;(wrapper.vm as any).toggle()
    expect((wrapper.vm as any).show).toBe(true)
  })
})
