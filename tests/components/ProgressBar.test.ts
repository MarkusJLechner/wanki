import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressBar from '../../src/components/ProgressBar.vue'

describe('ProgressBar.vue', () => {
  it('calculates progress correctly', () => {
    const wrapper = mount(ProgressBar, {
      props: { value: 5, total: 10 },
    })
    expect(wrapper.text()).toContain('50')
  })
})
