import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FlexSpacer from '../../src/components/FlexSpacer.vue'

describe('FlexSpacer.vue', () => {
  it('renders grow div', () => {
    const wrapper = mount(FlexSpacer)
    expect(wrapper.html()).toContain('grow')
  })
})
