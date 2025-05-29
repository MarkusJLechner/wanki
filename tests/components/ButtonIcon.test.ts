import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonIcon from '../../src/components/ButtonIcon.vue'

describe('ButtonIcon.vue', () => {
  it('renders default icon', () => {
    const wrapper = mount(ButtonIcon)
    expect(wrapper.find('i').classes()).toContain('far')
  })

  it('renders slot content', () => {
    const wrapper = mount(ButtonIcon, {
      slots: { content: '<span class="content">slot</span>' },
    })
    expect(wrapper.find('.content').exists()).toBe(true)
  })
})
