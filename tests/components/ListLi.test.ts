import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ListLi from '../../src/components/ListLi.vue'

vi.mock('../../src/components/InputBoolean.vue', () => ({ __esModule: true, default: { template: '<input />' } }))
vi.mock('../../src/components/ListHr.vue', () => ({ __esModule: true, default: { template: '<hr />' } }))
vi.mock('../../src/components/ModalRadio.vue', () => ({ __esModule: true, default: { template: '<div />' } }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('ListLi.vue', () => {
  it('emits item when clicked', async () => {
    const wrapper = mount(ListLi, { props: { item: { text: 'Item' } } })
    await wrapper.find('li').trigger('click')
    expect(wrapper.emitted('item')).toBeTruthy()
  })
})
