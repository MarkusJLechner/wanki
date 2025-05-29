import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModalOptions from '../../src/components/ModalOptions.vue'

vi.mock('../../src/components/BaseModal.vue', () => ({ default: { template: '<div><slot /></div>' } }))
vi.mock('../../src/components/List.vue', () => ({
  __esModule: true,
  default: { template: `<ul class='list' @click="emitItem"></ul>`, methods: { emitItem() { this.$emit('item', { text: 'x' }) } } }
}))

describe('ModalOptions.vue', () => {
  it('emits item when option clicked', async () => {
    const wrapper = mount(ModalOptions, { props: { items: [{ text: 'x' }], modelValue: {} } })
    await wrapper.find('.list').trigger('click')
    expect(wrapper.emitted('item')).toBeTruthy()
  })
})
