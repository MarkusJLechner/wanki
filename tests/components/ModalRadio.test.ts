import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ModalRadio from '../../src/components/ModalRadio.vue'

vi.useFakeTimers()
vi.mock('../../src/components/BaseModal.vue', () => ({ default: { template: '<div><slot /></div>' } }))
vi.mock('../../src/components/InputRadio.vue', () => ({ default: { name: 'InputRadio', template: '<div class="radio" @click="$emit(\'item\', {value:\'x\'})"></div>' } }))
vi.mock('../../src/store/globalstate', () => ({ refstorage: { get: vi.fn().mockReturnValue('a'), set: vi.fn() } }))

describe('ModalRadio.vue', () => {
  it('emits close after selection', async () => {
    const wrapper = mount(ModalRadio, { props: { radioItems: [] } })
    await wrapper.find('.radio').trigger('click')
    vi.runAllTimers()
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
