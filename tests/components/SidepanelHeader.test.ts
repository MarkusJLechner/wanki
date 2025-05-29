import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SidepanelHeader from '../../src/components/SidepanelHeader.vue'

describe('SidepanelHeader.vue', () => {
  it('renders logo image', () => {
    const wrapper = mount(SidepanelHeader)
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
  })
})
