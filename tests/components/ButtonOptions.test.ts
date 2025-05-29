import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonOptions from '../../src/components/ButtonOptions.vue'

vi.mock('../../src/components/ButtonIcon.vue', () => ({
  default: { template: '<button @click="$emit(\'click\')"><slot name="content" /></button>' },
}))
vi.mock('../../src/components/List.vue', () => ({
  default: { template: '<ul><li class="item" /></ul>' },
}))

describe('ButtonOptions.vue', () => {
  it('emits item when option clicked', async () => {
    const wrapper = mount(ButtonOptions, { props: { value: [{ text: 'x' }] } })
    ;(wrapper.vm as any).onClickItem({ text: 'x' })
    expect(wrapper.emitted('item')).toBeTruthy()
  })
})
