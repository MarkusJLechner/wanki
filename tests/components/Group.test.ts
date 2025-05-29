import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Group from '../../src/components/Group.vue'

describe('Group.vue', () => {
  it('renders provided value', () => {
    const wrapper = mount(Group, { props: { value: 'Title' } })
    expect(wrapper.text()).toContain('Title')
  })
})
