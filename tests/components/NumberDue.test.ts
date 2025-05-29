import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberDue from '../../src/components/NumberDue.vue'

describe('NumberDue.vue', () => {
  it('applies color classes when value > 0', () => {
    const wrapper = mount(NumberDue, { props: { value: 3, color: 'red' } })
    expect(wrapper.classes()).toContain('text-red-500')
  })
})
