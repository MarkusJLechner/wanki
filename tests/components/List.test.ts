import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import List from '../../src/components/List.vue'
import { commonGlobal } from '../common.ts'

vi.mock('../../src/components/InputBoolean.vue', () => ({
  __esModule: true,
  default: { template: '<input />' },
}))
vi.mock('../../src/components/ListHr.vue', () => ({
  __esModule: true,
  default: { template: '<hr />' },
}))
vi.mock('../../src/components/ModalRadio.vue', () => ({
  __esModule: true,
  default: { template: '<div />' },
}))
vi.mock('../../src/components/ModalTextfield.vue', () => ({
  __esModule: true,
  default: { template: '<div />' },
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('List.vue', () => {
  it('emits item when clicked', async () => {
    const wrapper = mount(List, {
      props: { value: [{ text: 'Item' }] },
      global: {
        ...commonGlobal,
      },
    })
    await wrapper.find('li').trigger('click')
    expect(wrapper.emitted('item')).toBeTruthy()
  })
})
