import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingLogo from '../../src/components/LoadingLogo.vue'

describe('LoadingLogo.vue', () => {
  it('renders svg logo', () => {
    const wrapper = mount(LoadingLogo)
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.classes()).toContain('logo')
  })
})
