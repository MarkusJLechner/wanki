import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InputBoolean from '../../src/components/InputBoolean.vue'

describe('InputBoolean.vue', () => {
  it('toggles value on click', async () => {
    const wrapper = mount(InputBoolean, {
      props: { modelValue: false },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })
})
