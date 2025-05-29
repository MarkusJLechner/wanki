import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ListTreeItem from '../../src/components/ListTreeItem.vue'

vi.mock('../../src/components/ListLi.vue', () => ({
  default: { template: '<li><slot /></li>' },
}))
vi.mock('../../src/components/ListHr.vue', () => ({
  default: { template: '<hr />' },
}))

describe('ListTreeItem.vue', () => {
  it('toggles open state', async () => {
    const item = { text: 'a', children: [{ text: 'child' }] }
    const wrapper = shallowMount(ListTreeItem, { props: { item } })
    expect((wrapper.vm as any).isOpen).toBe(false)
    ;(wrapper.vm as any).toggle()
    expect((wrapper.vm as any).isOpen).toBe(true)
  })
})
