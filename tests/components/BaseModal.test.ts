import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseModal from '../../src/components/BaseModal.vue'

vi.mock('../../src/store/globalstate.ts', () => ({
  modalOpened: { value: false },
}))

describe('BaseModal.vue', () => {
  it('emits open and close events', async () => {
    const wrapper = mount(BaseModal, { props: { modelValue: false } })
    ;(wrapper.vm as any).open()
    expect(wrapper.emitted('open')).toBeTruthy()
    ;(wrapper.vm as any).onClose()
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([false])
  })
})
