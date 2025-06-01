import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../../src/components/Button.vue'
import { commonGlobal } from '../common.ts'

describe('Button.vue', () => {
  it('renders provided text', () => {
    const wrapper = mount(Button, {
      props: { text: 'Click me', loading: false },
      global: {
        ...commonGlobal,
      },
    })
    expect(wrapper.text()).toContain('Click me')
  })
})
