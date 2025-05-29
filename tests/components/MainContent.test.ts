import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MainContent from '../../src/components/MainContent.vue'

vi.mock('../../src/components/LoadingLogo.vue', () => ({ default: { template: '<div class="logo" />' } }))

describe('MainContent.vue', () => {
  it('renders slot content', () => {
    const wrapper = mount(MainContent, { slots: { default: '<span class="slot" />' } })
    expect(wrapper.find('.slot').exists()).toBe(true)
  })
})
