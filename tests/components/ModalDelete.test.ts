import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModalDelete from '../../src/components/ModalDelete.vue'

vi.mock('../../src/components/BaseModal.vue', () => ({
  default: { template: '<div class="modal"><slot /></div>' },
}))

describe('ModalDelete.vue', () => {
  it('renders slot content', () => {
    const wrapper = mount(ModalDelete, { slots: { default: 'Are you sure?' } })
    expect(wrapper.text()).toContain('Are you sure?')
  })
})
