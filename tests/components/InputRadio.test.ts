import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InputRadio from '../../src/components/InputRadio.vue'

vi.mock('../../src/components/List.vue', () => ({
  default: {
    template:
      '<ul><li v-for="(item, index) in value" @click="$emit(\'item\', item)"><slot name="prefix-item" :item="item"></slot></li></ul>',
    props: ['value'],
  },
}))

describe('InputRadio.vue', () => {
  it('selects item on click', async () => {
    const items = [{ value: 'a' }, { value: 'b' }]
    const wrapper = mount(InputRadio, { props: { items } })
    await wrapper.find('li').trigger('click')
    const emitted = wrapper.emitted('update:items')?.pop()?.[0]
    expect(emitted[0].selected).toBe(true)
  })

  it('initial selection from value prop', () => {
    const items = [{ value: 'a' }, { value: 'b' }]
    mount(InputRadio, { props: { items, value: 'b' } })
    expect(items[1].selected).toBe(true)
  })
})
