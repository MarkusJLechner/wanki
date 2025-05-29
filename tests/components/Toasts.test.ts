import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Toasts from '../../src/components/Toasts.vue'
import { toasts } from '../../src/store/globalstate.ts'

describe('Toasts.vue', () => {
  it('renders provided toasts', async () => {
    const wrapper = mount(Toasts)
    toasts.value = [
      { id: '1', type: 'info', text: 'Hello', timeout: 1 },
      { id: '2', type: 'success', text: 'Great', timeout: 1 },
    ]
    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.mb-2').length).toBe(2)
    toasts.value = []
  })
})
