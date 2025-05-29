import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BackgroundTask from '../../src/components/BackgroundTask.vue'

describe('BackgroundTask.vue', () => {
  it('renders tasks from event', async () => {
    const wrapper = mount(BackgroundTask, {
      global: { stubs: { LoadingIcon: true } },
    })
    const event = new CustomEvent('background/task', {
      detail: { text: 'work', loading: true },
    })
    document.dispatchEvent(event)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('work')
  })
})
