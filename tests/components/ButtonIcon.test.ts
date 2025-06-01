import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonIcon from '../../src/components/ButtonIcon.vue'
import { commonGlobal } from '../common.ts'

describe('ButtonIcon.vue', () => {
  it('renders default icon', () => {
    const wrapper = mount(ButtonIcon, {
      global: {
        ...commonGlobal,
      },
    })
    expect(wrapper.find('i').classes()).toContain('far')
  })

  it('renders slot content', () => {
    const wrapper = mount(ButtonIcon, {
      slots: { content: '<span class="content">slot</span>' },
      global: {
        ...commonGlobal,
      },
    })
    expect(wrapper.find('.content').exists()).toBe(true)
  })

  it('shows dot when show-dot is true', () => {
    const wrapper = mount(ButtonIcon, {
      props: { showDot: true },
      global: {
        ...commonGlobal,
      },
    })
    expect(wrapper.find('.bg-red-600').exists()).toBe(true)
  })
})
