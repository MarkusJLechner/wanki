import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ListTree from '../../src/components/ListTree.vue'

vi.mock('../../src/components/ListTreeItem.vue', () => ({
  default: { template: '<div class="tree-item" />' },
}))

describe('ListTree.vue', () => {
  it('renders tree item', () => {
    const wrapper = mount(ListTree, { props: { modelValue: { text: 'root' } } })
    expect(wrapper.find('.tree-item').exists()).toBe(true)
  })
})
