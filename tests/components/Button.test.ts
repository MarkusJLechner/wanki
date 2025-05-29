import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../../src/components/Button.vue'

describe('Button.vue', () => {
  it('renders provided text', () => {
    const wrapper = mount(Button, {
      props: { text: 'Click me', loading: false },
    })
    expect(wrapper.text()).toContain('Click me')
  })
})
