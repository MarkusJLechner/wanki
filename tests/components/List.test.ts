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
vi.mock('vue-virtual-scroller/dist/vue-virtual-scroller.esm', () => ({
  DynamicScroller: {
    template:
      '<ul class="scroller"><slot :item="items[0]" :index="0" :active="true"></slot></ul>',
    props: ['items', 'minItemSize'],
  },
  DynamicScrollerItem: {
    template: '<li><div class="clickable-item"><slot></slot></div></li>',
    props: ['item', 'active', 'sizeDependencies', 'dataIndex'],
  },
}))

describe('List.vue', () => {
  it('emits item when clicked', async () => {
    const wrapper = mount(List, {
      props: { value: [{ text: 'Item' }] },
      global: {
        ...commonGlobal,
      },
    })

    // Call the onClick method directly with the first item
    await wrapper.vm.onClick(wrapper.vm.computedValue[0])

    expect(wrapper.emitted('item')).toBeTruthy()
  })
})
