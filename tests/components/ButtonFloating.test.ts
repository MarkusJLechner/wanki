import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonFloating from '../../src/components/ButtonFloating.vue'
import { commonGlobal } from '../common.ts'

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }))

const items = [{ text: 'Item', icon: 'fas fa-plus' }]

describe('ButtonFloating.vue', () => {
  it('toggles list visibility on click', async () => {
    const wrapper = mount(ButtonFloating, {
      props: { modelValue: items },
      global: {
        ...commonGlobal,
      },
    })
    expect(wrapper.findAll('li').length).toBe(0)
    await wrapper.find('[data-test="floating-button"]').trigger('click')
    expect(wrapper.findAll('li').length).toBe(1)
    await wrapper.find('[data-test="floating-button"]').trigger('click')
    expect(wrapper.findAll('li').length).toBe(0)
  })
})
