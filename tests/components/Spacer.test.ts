import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Spacer from '../../src/components/Spacer.vue'
import FlexSpacer from '../../src/components/FlexSpacer.vue'

describe('Spacer.vue', () => {
  it('renders grow div', () => {
    const wrapper = mount(Spacer)
    expect(wrapper.classes()).toContain('grow')
  })
})

describe('FlexSpacer.vue', () => {
  it('renders grow div', () => {
    const wrapper = mount(FlexSpacer)
    expect(wrapper.classes()).toContain('grow')
  })
})
