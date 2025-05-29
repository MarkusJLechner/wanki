import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InputTextField from '../../src/components/InputTextField.vue'

describe('InputTextField.vue', () => {
  it('updates bound model value', async () => {
    const wrapper = mount(InputTextField, {
      props: { modelValue: '' },
    })
    const input = wrapper.find('input')
    await input.setValue('hello')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['hello'])
  })
})
