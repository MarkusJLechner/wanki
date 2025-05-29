import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ListHr from '../../src/components/ListHr.vue'

describe('ListHr.vue', () => {
  it('renders hr element', () => {
    const wrapper = mount(ListHr)
    expect(wrapper.element.tagName).toBe('HR')
  })
})
