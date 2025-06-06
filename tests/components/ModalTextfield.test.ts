import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModalTextfield from '../../src/components/ModalTextfield.vue'

vi.mock('../../src/components/BaseModal.vue', () => ({
  default: { template: '<div><slot /></div>' },
}))
vi.mock('../../src/components/InputTextField.vue', () => ({
  default: {
    template:
      '<input @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
  },
}))
vi.mock('../../src/store/globalstate', () => ({
  refstorage: { get: vi.fn(), getValueType: vi.fn(), set: vi.fn() },
}))

describe('ModalTextfield.vue', () => {
  it('emits input update', async () => {
    const wrapper = mount(ModalTextfield)
    const input = wrapper.find('input')
    ;(input.element as HTMLInputElement).value = 'abc'
    await input.trigger('input')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['abc'])
  })

  it('emits close on confirm', () => {
    const wrapper = mount(ModalTextfield)
    ;(wrapper.vm as any).onConfirm()
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
