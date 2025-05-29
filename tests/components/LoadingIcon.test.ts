import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingIcon from '../../src/components/LoadingIcon.vue'

describe('LoadingIcon.vue', () => {
  it('renders spinner icon', () => {
    const wrapper = mount(LoadingIcon)
    const icon = wrapper.find('i')
    expect(icon.classes()).toContain('fa-spinner')
  })
})
